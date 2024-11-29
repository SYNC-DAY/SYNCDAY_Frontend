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

		<!-- Organizations Accordion -->
		<Accordion v-model:activeIndex="activeIndex" @tab-change="handleTabChange">
			<AccordionTab v-for="org in organizations" :key="org.login">
				<template #header>
					<div class="flex items-center gap-3">
						<!-- <img :src="org.avatar_url" :alt="org.login" class="w-8 h-8 rounded-full" /> -->
						<div>
							<span class="font-medium">{{ org.login }}</span>
							<span class="text-sm text-gray-500 ml-2">({{ org.membershipRole }})</span>
						</div>
					</div>
				</template>

				<!-- Projects Content -->
				<div class="mt-4">
					<!-- Loading State -->
					<div v-if="loadingOrgs.has(org.login)" class="flex justify-center p-4">
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
			</AccordionTab>
		</Accordion>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore';
import { storeToRefs } from 'pinia';

// Store setup
const orgStore = useGithubOrgStore();
const projectsStore = useGithubProjectsStore();
const { organizations: orgList } = storeToRefs(orgStore);

// Local state
const error = ref(null);
const activeIndex = ref(null);
const selectedProject = ref(null);
const loadingOrgs = ref(new Set());

// Computed property for organizations
const organizations = computed(() => {
	return Object.values(orgList.value);
});

// Methods
async function onProjectSelect(org, project) {
	selectedProject.value = project;
	emit('select', { org, project });
}

async function handleTabChange(event) {
	const org = organizations.value[event.index];
	if (!org) return;
	console.log("handleTagChange")

	// Skip if projects are already loaded
	if (org.projects?.length > 0) return;

	try {
		loadingOrgs.value.add(org.login);
		const projects = await orgStore.fetchOrgProjects(org.login);

		// Update organization with projects
		org.projects = projects;

	} catch (err) {
		error.value = `Failed to fetch projects for ${org.login}: ${err.message}`;
		console.error('Project fetch error:', err);
	} finally {
		loadingOrgs.value.delete(org.login);
	}
}

async function refreshOrganizations() {
	try {
		error.value = null;
		selectedProject.value = null;
		activeIndex.value = null;
		loadingOrgs.value.clear();

		await orgStore.clearState();
		await projectsStore.clearState();
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
:deep(.p-accordion-header-link) {
	padding: 1rem !important;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
	cursor: pointer;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
	background-color: var(--surface-hover);
}
</style>