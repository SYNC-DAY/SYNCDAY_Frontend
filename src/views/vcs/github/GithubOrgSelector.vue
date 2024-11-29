<template>
	<div class="github-org-selector">
		<Accordion :activeIndex="activeIndex" @tab-change="handleTabChange">
			<!-- Organizations Tab -->
			<AccordionTab header="Select Organization">
				<div class="orgs-container">
					<div class="loading-state flex justify-center p-4" v-if="orgsLoading">
						<i class="pi pi-spinner animate-spin text-2xl"></i>
					</div>

					<div v-else-if="orgStore.allOrganizations.length" class="grid gap-3">
						<div v-for="org in orgStore.allOrganizations" :key="org.login" @click="selectOrganization(org)"
							class="org-item p-4 border rounded cursor-pointer transition-all hover:border-primary"
							:class="{ 'border-primary bg-primary-50': selectedOrg?.login === org.login }">
							<div class="flex items-center gap-3">
								<img :src="org.avatar_url" :alt="org.login" class="w-10 h-10 rounded-full" />
								<div class="flex-grow">
									<h4 class="font-medium text-gray-900">{{ org.login }}</h4>
									<p class="text-sm text-gray-600">{{ org.description }}</p>
								</div>
								<i v-if="selectedOrg?.login === org.login" class="pi pi-check text-primary"></i>
							</div>
						</div>
					</div>

					<div v-else class="empty-state text-center p-6 bg-gray-50 rounded">
						<i class="pi pi-building text-4xl text-gray-400 mb-3"></i>
						<p class="text-gray-600">No organizations found</p>
					</div>
				</div>
			</AccordionTab>

			<!-- Projects Tab -->
			<AccordionTab header="Select Project" :disabled="!selectedOrg">
				<template #header>
					<div class="flex items-center gap-2">
						<span>Select Project</span>
						<span v-if="selectedOrg" class="text-sm text-gray-500">
							({{ selectedOrg.login }})
						</span>
					</div>
				</template>

				<div class="projects-container">
					<div class="loading-state flex justify-center p-4" v-if="projectsLoading">
						<i class="pi pi-spinner animate-spin text-2xl"></i>
					</div>

					<div v-else-if="projectStore.userProjects.length" class="grid gap-3">
						<div v-for="project in projectStore.userProjects" :key="project.id"
							@click="selectProject(project)"
							class="project-item p-4 border rounded cursor-pointer transition-all hover:border-primary"
							:class="{ 'border-primary bg-primary-50': selectedProject?.id === project.id }">
							<div class="flex items-center justify-between">
								<div class="project-info">
									<h4 class="font-medium text-gray-900">{{ project.title }}</h4>
									<p v-if="project.shortDescription" class="text-sm text-gray-600 mt-1">
										{{ project.shortDescription }}
									</p>
									<div class="flex items-center gap-2 mt-2">
										<Tag :severity="project.closed ? 'danger' : 'success'">
											{{ project.closed ? 'Closed' : 'Open' }}
										</Tag>
										<span class="text-xs text-gray-500">
											Updated: {{ formatDate(project.updatedAt) }}
										</span>
									</div>
								</div>
								<i v-if="selectedProject?.id === project.id" class="pi pi-check text-primary"></i>
							</div>
						</div>
					</div>

					<div v-else class="empty-state text-center p-6 bg-gray-50 rounded">
						<i class="pi pi-folder-open text-4xl text-gray-400 mb-3"></i>
						<p class="text-gray-600">No projects found in this organization</p>
					</div>
				</div>
			</AccordionTab>
		</Accordion>

		<!-- Action Buttons -->
		<div class="flex justify-end gap-2 mt-4">
			<Button label="Cancel" severity="secondary" text @click="$emit('cancel')" />
			<Button label="Connect Project" :disabled="!selectedProject" @click="handleConnect" />
		</div>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore'
import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore'

const emit = defineEmits(['cancel', 'connect'])

// Stores
const orgStore = useGithubOrgStore()
const projectStore = useGithubProjectsStore()

// State
const activeIndex = ref(0)
const orgsLoading = ref(false)
const projectsLoading = ref(false)
const selectedOrg = ref(null)
const selectedProject = ref(null)

// Methods
const fetchOrganizations = async () => {
	try {
		orgsLoading.value = true
		await orgStore.fetchOrganizations()
	} catch (error) {
		console.error('Error fetching organizations:', error)
	} finally {
		orgsLoading.value = false
	}
}

const fetchProjects = async () => {
	if (!selectedOrg.value) return

	try {
		projectsLoading.value = true
		await projectStore.fetchUserProjects()
	} catch (error) {
		console.error('Error fetching projects:', error)
	} finally {
		projectsLoading.value = false
	}
}

const selectOrganization = (org) => {
	selectedOrg.value = org
	selectedProject.value = null
	activeIndex.value = 1 // Move to projects tab
}

const selectProject = (project) => {
	selectedProject.value = project
}

const handleTabChange = (event) => {
	activeIndex.value = event.index
}

const handleConnect = () => {
	if (selectedOrg.value && selectedProject.value) {
		emit('connect', {
			organization: selectedOrg.value,
			project: selectedProject.value
		})
	}
}

const formatDate = (dateString) => {
	if (!dateString) return ''
	return new Intl.DateTimeFormat('default', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(new Date(dateString))
}

// Watchers
watch(() => selectedOrg.value, () => {
	if (selectedOrg.value) {
		fetchProjects()
	}
})

// Initial load
fetchOrganizations()
</script>

<style scoped>
.animate-spin {
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
}

:deep(.p-accordion-header-text) {
	flex: 1;
}

.org-item,
.project-item {
	background: white;
	transition: all 0.2s ease;
}

.org-item:hover,
.project-item:hover {
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>