<template>
	<Dialog :visible="visible" modal :style="{ width: '25rem' }" @update:visible="$emit('update:visible')">
		<template #header>
			<div class="container-row vcs-integration-header">
				<i class="pi pi-github"></i>
				<span>Github Integration</span>
			</div>
		</template>

		<div class="p-4">
			<div v-if="loading" class="text-center">
				<i class="pi pi-spinner pi-spin text-2xl"></i>
			</div>

			<div v-else-if="error" class="mt-3 text-red-500 text-sm">
				{{ error }}
			</div>

			<div v-else>
				<CascadeSelect v-model="selected" :options="cascadeOptions" optionLabel="name" optionGroupLabel="name"
					optionGroupChildren="projects" class="w-full" placeholder="Select Organization and Project"
					@change="handleSelection">
					<template #option="{ option }">
						<div class="flex align-items-center gap-2">
							<span v-if="option.avatar_url">
								<Avatar :src="option.avatar_url" class="mr-2" />
							</span>
							<span>{{ option.name }}</span>
						</div>
					</template>
				</CascadeSelect>
			</div>
		</div>

		<template #footer>
			<div class="flex justify-end gap-2">
				<Button label="Cancel" severity="secondary" @click="$emit('update:visible', false)" />
				<Button label="Connect" :loading="loading" :disabled="!selected || loading" @click="handleConnect" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import CascadeSelect from 'primevue/cascadeselect';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { storeToRefs } from 'pinia';

const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	}
});

const emit = defineEmits(['update:visible', 'select']);

// Store and local state
const orgStore = useGithubOrgStore();
const { organizations } = storeToRefs(orgStore);

const error = ref(null);
const selected = ref(null);
const loading = ref(false);
const orgRepositories = ref({});

// Transform organizations data for CascadeSelect
const cascadeOptions = computed(() => {
	const orgs = organizations.value;
	// Convert object to array if it's not already an array
	const orgsArray = Array.isArray(orgs) ? orgs : Object.values(orgs || {});

	return orgsArray.map(org => ({
		name: org.login,
		avatar_url: org.avatar_url,
		projects: orgRepositories.value[org.login] || [],
		originalData: org
	}));
});

// Load organizations and their repositories
const loadOrganizations = async () => {
	try {
		loading.value = true;
		error.value = null;

		await orgStore.fetchOrganizations(true);

		if (Array.isArray(organizations.value)) {
			for (const org of organizations.value) {
				try {
					const repos = await orgStore.fetchOrgRepositories(org.login);
					orgRepositories.value[org.login] = repos.map(repo => ({
						name: repo.name,
						id: repo.id,
						full_name: repo.full_name,
						html_url: repo.html_url,
						originalData: repo
					}));
				} catch (repoError) {
					console.error(`Failed to fetch repositories for ${org.login}:`, repoError);
				}
			}
		}
	} catch (err) {
		error.value = `Failed to load organizations: ${err.message}`;
		console.error('Loading error:', err);
	} finally {
		loading.value = false;
	}
};

// Watch for visibility changes
watch(() => props.visible, async (newValue) => {
	if (newValue) {
		await loadOrganizations();
	}
}, { immediate: true });

const handleSelection = (event) => {
	console.log('Selection made:', event.value);
};

const handleConnect = () => {
	if (selected.value) {
		const org = selected.value.originalData;
		const project = selected.value.projects?.originalData;
		emit('select', { org, project });
		emit('update:visible', false);
	}
};
</script>

<style scoped>
.vcs-integration-header {
	gap: 1rem;
}

.vcs-integration-header i {
	font-size: 1.5rem;
}

:deep(.p-cascadeselect) {
	width: 100%;
}
</style>