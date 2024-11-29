<!-- GithubOrgProjectSelector.vue -->
<template>
	<div class="p-4">
		<!-- Header with Refresh Button -->
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold">GitHub Organizations</h2>
			<Button @click="refreshOrganizations" icon="pi pi-refresh" :loading="orgStore.isLoading" />
		</div>

		<!-- Error Display -->
		<Message v-if="error" severity="error" :closable="false" class="mb-4">
			{{ error }}
		</Message>

		<!-- Organizations List -->
		<div class="mb-4">
			<div v-for="org in organizations" :key="org.login"
				class="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
				:class="{ 'bg-gray-100': selectedOrg?.login === org.login }" @click="selectOrganization(org)">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div>
							<span class="font-medium">{{ org.login }}</span>
							<span class="text-sm text-gray-500 ml-2">({{ org.membershipRole }})</span>
						</div>
					</div>
					<i class="pi"
						:class="{ 'pi-chevron-down': selectedOrg?.login === org.login, 'pi-chevron-right': selectedOrg?.login !== org.login }"></i>
				</div>

				<!-- Projects Section (Expanded when org is selected) -->
				<div v-if="selectedOrg?.login === org.login" class="mt-4">
					<!-- Loading State -->
					<div v-if="loadingProjects" class="flex justify-center p-4">
						<ProgressSpinner style="width:50px;height:50px" />
					</div>

					<!-- Projects Table -->
					<div v-else-if="org.projects?.length" class="card">
						<DataTable :value="org.projects" v-model:selection="selectedProject" selectionMode="single"
							@row-select="(event) => onProjectSelect(org, event.data)" dataKey="id"
							class="p-datatable-sm" :scrollable="true" scrollHeight="400px">
							<Column field="title" header="Project">
								<template #body="slotProps">
									<div>
										<div class="font-medium">{{ slotProps.data.title }}</div>
										<div v-if="slotProps.data.shortDescription" class="text-sm text-gray-500">
											{{ slotProps.data.shortDescription }}
										</div>
									</div>
								</template>
							</Column>

							<Column field="status" header="Status" style="width: 100px">
								<template #body="slotProps">
									<Tag :severity="slotProps.data.closed ? 'danger' : 'success'">
										{{ slotProps.data.closed ? 'Closed' : 'Open' }}
									</Tag>
								</template>
							</Column>

							<Column field="updatedAt" header="Last Updated" style="width: 150px">
								<template #body="slotProps">
									{{ new Date(slotProps.data.updatedAt).toLocaleDateString() }}
								</template>
							</Column>
						</DataTable>
					</div>

					<!-- No Projects State -->
					<div v-else class="text-center text-gray-500 py-4">
						No projects found for this organization.
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { storeToRefs } from 'pinia';

// Store setup
const orgStore = useGithubOrgStore();
const { organizations: orgList, selectedOrg } = storeToRefs(orgStore);

// Local state
const error = ref(null);
const selectedProject = ref(null);
const loadingProjects = ref(false);

// Computed property for organizations
const organizations = computed(() => {
	return Object.values(orgList.value);
});

// Methods
async function selectOrganization(org) {
	try {
		if (selectedOrg.value?.login === org.login) {
			// If clicking the same org, collapse it
			orgStore.selectOrg(null);
			return;
		}

		loadingProjects.value = true;
		error.value = null;

		// Select the organization first
		orgStore.selectOrg(org.login);

		// Fetch projects if they haven't been fetched yet
		if (!org.projectsFetched) {
			await orgStore.fetchOrgProjects(org.login);
		}
	} catch (err) {
		error.value = `Failed to fetch projects for ${org.login}: ${err.message}`;
		console.error('Project fetch error:', err);
	} finally {
		loadingProjects.value = false;
	}
}

async function onProjectSelect(org, project) {
	selectedProject.value = project;
	emit('select', { org, project });
}

async function refreshOrganizations() {
	try {
		error.value = null;
		selectedProject.value = null;
		loadingProjects.value = false;

		await orgStore.clearState();
		await orgStore.fetchOrganizations(true);
	} catch (err) {
		error.value = `Failed to refresh organizations: ${err.message}`;
		console.error('Refresh error:', err);
	}
}

// Initial load
onMounted(async () => {
	try {
		await orgStore.fetchOrganizations();
	} catch (err) {
		error.value = `Failed to load organizations: ${err.message}`;
		console.error('Initial load error:', err);
	}
});

// Event emits
const emit = defineEmits(['select']);
</script>

<style scoped>
:deep(.p-datatable .p-datatable-tbody > tr) {
	cursor: pointer;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
	background-color: var(--surface-hover);
}
</style>