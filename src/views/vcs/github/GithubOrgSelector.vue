<template>
	<div class="w-full">
		<!-- Organization Selection Header -->
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-bold">Organizations</h2>
			<button @click="refreshOrganizations"
				class="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600" :disabled="isLoading">
				Refresh
			</button>
		</div>

		<!-- Loading State -->
		<div v-if="isLoading" class="text-center py-4">
			<p>Loading organizations...</p>
		</div>

		<!-- Error State -->
		<div v-else-if="error" class="text-red-500 py-4">
			{{ error }}
		</div>

		<!-- Organizations List -->
		<div v-else class="space-y-4">
			<div v-for="org in organizations" :key="org.id" class="border rounded-lg p-4">
				<div class="flex items-center justify-between mb-4">
					<!-- Organization Info -->
					<div class="flex items-center">
						<img :src="org.avatarUrl" :alt="org.login" class="w-10 h-10 rounded-full mr-3" />
						<div>
							<h3 class="font-semibold">{{ org.login }}</h3>
							<p class="text-sm text-gray-600">Role: {{ org.membershipRole }}</p>
						</div>
					</div>

					<!-- View Projects Button -->
					<button @click="toggleOrgProjects(org)"
						class="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">
						{{ org.showProjects ? 'Hide Projects' : 'View Projects' }}
					</button>
				</div>

				<!-- Projects Section -->
				<div v-if="org.showProjects" class="mt-4">
					<div v-if="getOrgProjects(org.login).length > 0" class="space-y-2">
						<div v-for="project in getOrgProjects(org.login)" :key="project.id"
							class="p-3 bg-gray-50 rounded">
							<div class="flex justify-between items-center">
								<a :href="project.url" target="_blank" class="text-blue-600 hover:underline">
									{{ project.title }}
								</a>
								<span class="text-sm text-gray-500">
									#{{ project.number }}
								</span>
							</div>
							<p v-if="project.shortDescription" class="text-sm text-gray-600 mt-1">
								{{ project.shortDescription }}
							</p>
							<div class="text-xs text-gray-500 mt-1">
								Last updated: {{ new Date(project.updatedAt).toLocaleDateString() }}
							</div>
						</div>
					</div>
					<p v-else class="text-gray-500 text-sm">
						No projects found for this organization.
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore';

const orgStore = useGithubOrgStore();
const projectsStore = useGithubProjectsStore();
console.log('Projects Store:', projectsStore);
console.log('Store methods:', Object.getOwnPropertyNames(projectsStore));
console.log('Store prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(projectsStore)));

const organizations = ref([]);
const isLoading = ref(false);
const error = ref(null);

const getOrgProjects = (orgName) => {
	return projectsStore.getOrgProjects(orgName);
};

async function fetchOrganizations(forceRefresh = false) {
	try {
		isLoading.value = true;
		error.value = null;
		const orgs = await orgStore.fetchOrganizations(forceRefresh);
		organizations.value = orgs.map(org => ({
			...org,
			showProjects: false
		}));
	} catch (err) {
		error.value = "Failed to fetch organizations: " + err.message;
	} finally {
		isLoading.value = false;
	}
}


// Add immediate console log to check the store
console.log('Projects Store:', projectsStore);

async function toggleOrgProjects(org) {
	// Add debug logging
	console.log('Store methods:', Object.keys(projectsStore));

	org.showProjects = !org.showProjects;

	if (org.showProjects && !projectsStore.getOrgProjects(org.login).length) {
		try {
			isLoading.value = true;
			// Check if the method exists
			if (typeof projectsStore.fetchOrgProjects !== 'function') {
				throw new Error('fetchOrgProjects method not available');
			}
			await projectsStore.fetchOrgProjects(org.login);
		} catch (err) {
			error.value = `Failed to fetch projects for ${org.login}: ${err.message}`;
			console.error('Store error:', err);
		} finally {
			isLoading.value = false;
		}
	}
}

async function refreshOrganizations() {
	await fetchOrganizations(true);
	// Clear cached projects
	organizations.value.forEach(org => {
		org.showProjects = false;
		projectsStore.clearOrgProjects(org.login);
	});
}

onMounted(async () => {
	await fetchOrganizations();
});
</script>