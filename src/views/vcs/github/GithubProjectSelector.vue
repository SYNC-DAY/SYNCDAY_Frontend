<template>
	<div class="github-project-selector">
		<h3 class="text-lg font-semibold mb-4">Select Project</h3>

		<!-- Loading State -->
		<div v-if="isLoading" class="flex items-center justify-center p-4">
			<i class="pi pi-spinner animate-spin text-2xl"></i>
		</div>

		<!-- Error State -->
		<div v-if="error" class="p-4 bg-red-50 text-red-500 rounded mb-4">
			{{ error }}
			<Button label="Retry" severity="secondary" text @click="fetchProjects" class="ml-2" />
		</div>

		<!-- Projects List -->
		<div v-if="!isLoading" class="projects-list space-y-3">
			<div v-for="project in projects.userProjects" :key="project.id" @click="handleProjectSelect(project)"
				class="project-card p-4 rounded border cursor-pointer transition-all hover:border-primary"
				:class="{ 'border-primary bg-primary-50': selectedProject?.id === project.id }">
				<div class="flex items-center justify-between">
					<div class="project-info">
						<h4 class="font-medium text-gray-900">{{ project.title }}</h4>
						<p v-if="project.shortDescription" class="text-sm text-gray-600 mt-1">
							{{ project.shortDescription }}
						</p>
						<div class="flex items-center gap-2 mt-2">
							<span class="text-xs px-2 py-1 rounded-full"
								:class="project.closed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
								{{ project.closed ? 'Closed' : 'Open' }}
							</span>
							<span class="text-xs text-gray-500">
								Last updated: {{ formatDate(project.updatedAt) }}
							</span>
						</div>
					</div>

					<div v-if="selectedProject?.id === project.id" class="text-primary">
						<i class="pi pi-check text-xl"></i>
					</div>
				</div>

				<!-- Project Items Preview -->
				<div v-if="selectedProject?.id === project.id && project.items.nodes.length" class="mt-4 border-t pt-4">
					<h5 class="text-sm font-medium mb-2">Recent Items</h5>
					<ul class="space-y-2">
						<li v-for="item in project.items.nodes.slice(0, 3)" :key="item.id"
							class="text-sm text-gray-600">
							<i class="pi"
								:class="item.content?.state === 'OPEN' ? 'pi-circle-fill text-green-500' : 'pi-check-circle text-blue-500'"></i>
							<span class="ml-2">{{ item.content?.title }}</span>
						</li>
					</ul>
				</div>
			</div>

			<!-- Empty State -->
			<div v-if="!isLoading && projects.userProjects.length === 0" class="text-center p-6 bg-gray-50 rounded">
				<i class="pi pi-folder-open text-4xl text-gray-400 mb-3"></i>
				<p class="text-gray-600">No projects found in this organization</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore'
import Button from 'primevue/button'

const props = defineProps({
	orgName: {
		type: String,
		required: true
	}
})

const emit = defineEmits(['project-select'])

// State
const projects = useGithubProjectsStore()
const isLoading = ref(false)
const error = ref(null)
const selectedProject = ref(null)

// Methods
const fetchProjects = async () => {
	try {
		isLoading.value = true
		error.value = null
		await projects.fetchUserProjects()
	} catch (err) {
		console.error('Error fetching projects:', err)
		error.value = 'Failed to fetch projects. Please try again.'
	} finally {
		isLoading.value = false
	}
}

const handleProjectSelect = (project) => {
	selectedProject.value = project
	emit('project-select', project)
}

const formatDate = (dateString) => {
	if (!dateString) return ''
	const date = new Date(dateString)
	return new Intl.DateTimeFormat('default', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date)
}

// Watchers
watch(() => props.orgName, () => {
	if (props.orgName) {
		fetchProjects()
	}
})

// Lifecycle
onMounted(() => {
	if (props.orgName) {
		fetchProjects()
	}
})
</script>

<style scoped>
.project-card {
	background: white;
	border: 1px solid #e2e8f0;
}

.project-card:hover {
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

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
</style>