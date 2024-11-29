<template>
	<div class="min-h-screen bg-gray-50">
		<div class="max-w-4xl mx-auto py-6 px-4">
			<!-- Header -->
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-2xl font-semibold text-gray-900">GitHub Organizations</h2>
				<button @click="refreshOrganizations"
					class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					:disabled="isLoading">
					<svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none"
						viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
						<path class="opacity-75" fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
					</svg>
					<span>{{ isLoading ? 'Refreshing...' : 'Refresh' }}</span>
				</button>
			</div>

			<!-- Error Alert -->
			<div v-if="error" class="rounded-md bg-red-50 p-4 mb-6">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd" />
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error</h3>
						<div class="mt-2 text-sm text-red-700">
							<p>{{ error }}</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Organizations List -->
			<div class="space-y-6">
				<div v-for="org in organizations" :key="org.id" class="bg-white shadow rounded-lg overflow-hidden">
					<!-- Organization Header -->
					<div class="px-6 py-4 border-b border-gray-200">
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<img :src="org.avatarUrl" :alt="org.login" class="h-10 w-10 rounded-full" />
								<div class="ml-4">
									<h3 class="text-lg font-medium text-gray-900">{{ org.login }}</h3>
									<p class="text-sm text-gray-500">Role: {{ org.membershipRole }}</p>
								</div>
							</div>
							<button @click="toggleOrgProjects(org)"
								class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
								{{ org.showProjects ? 'Hide Projects' : 'View Projects' }}
							</button>
						</div>
					</div>

					<!-- Projects Section -->
					<div v-if="org.showProjects" class="px-6 py-4">
						<div v-if="getOrgProjectsLoading(org.login)" class="text-center py-4">
							<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
							<p class="mt-2 text-sm text-gray-500">Loading projects...</p>
						</div>
						<div v-else>
							<div v-if="getOrgProjects(org.login).length" class="space-y-4">
								<div v-for="project in getOrgProjects(org.login)" :key="project.id"
									class="bg-gray-50 rounded-lg p-4">
									<div class="flex justify-between items-start">
										<div>
											<a :href="project.url" target="_blank"
												class="text-lg font-medium text-blue-600 hover:text-blue-800">
												{{ project.title }}
											</a>
											<p v-if="project.shortDescription" class="mt-1 text-sm text-gray-600">
												{{ project.shortDescription }}
											</p>
										</div>
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
											:class="project.closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
											{{ project.closed ? 'Closed' : 'Open' }}
										</span>
									</div>
									<div class="mt-2 flex items-center text-sm text-gray-500">
										<svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20"
											fill="currentColor">
											<path fill-rule="evenodd"
												d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
												clip-rule="evenodd" />
										</svg>
										Updated {{ new Date(project.updatedAt).toLocaleDateString() }}
									</div>
								</div>
							</div>
							<p v-else class="text-sm text-gray-500">No projects found for this organization.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore';
import { storeToRefs } from 'pinia';

const orgStore = useGithubOrgStore();
const projectsStore = useGithubProjectsStore();

const organizations = ref([]);
const error = ref(null);
const loadingOrgs = new Set();

const { isLoading } = storeToRefs(projectsStore);

function getOrgProjectsLoading(orgName) {
	return loadingOrgs.has(orgName);
}

function getOrgProjects(orgName) {
	return projectsStore.getOrgProjects(orgName) || [];
}

async function toggleOrgProjects(org) {
	try {
		org.showProjects = !org.showProjects;

		if (org.showProjects && !getOrgProjects(org.login).length) {
			loadingOrgs.add(org.login);
			await projectsStore.fetchOrgProjects(org.login);
		}
	} catch (err) {
		console.error(`Error fetching projects for ${org.login}:`, err);
		error.value = `Failed to fetch projects for ${org.login}: ${err.message}`;
		org.showProjects = false;
	} finally {
		loadingOrgs.delete(org.login);
	}
}

async function fetchOrganizations(forceRefresh = false) {
	try {
		error.value = null;
		const orgs = await orgStore.fetchOrganizations(forceRefresh);
		organizations.value = orgs.map(org => ({
			...org,
			showProjects: false
		}));
	} catch (err) {
		console.error('Error fetching organizations:', err);
		error.value = `Failed to fetch organizations: ${err.message}`;
	}
}

async function refreshOrganizations() {
	organizations.value.forEach(org => {
		org.showProjects = false;
	});
	projectsStore.clearState();
	await fetchOrganizations(true);
}

onMounted(async () => {
	await fetchOrganizations();
});
</script>