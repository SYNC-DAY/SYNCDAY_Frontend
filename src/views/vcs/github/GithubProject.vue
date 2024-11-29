<template>
	<div class="flex h-full">
		<!-- Projects Sidebar -->
		<div class="w-64 border-r border-gray-200 bg-white overflow-y-auto">
			<div class="p-4 border-b border-gray-200">
				<div class="flex items-center gap-2">
					<icon-project class="h-5 w-5 text-gray-500" />
					<h2 class="font-semibold text-gray-700">Projects</h2>
				</div>
			</div>

			<div class="space-y-1 p-2">
				<button v-for="project in projects" :key="project.id" @click="handleProjectSelect(project.id)"
					class="w-full text-left px-3 py-2 rounded-lg text-sm" :class="[
						selectedProject?.id === project.id
							? 'bg-blue-50 text-blue-700'
							: 'hover:bg-gray-50'
					]">
					<div class="flex items-center gap-2">
						<icon-chevron-right class="h-4 w-4" />
						<span>{{ project.title }}</span>
					</div>
				</button>
			</div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 overflow-y-auto">
			<div v-if="loading && !projects.length" class="flex items-center justify-center h-64">
				<div class="text-gray-500">Loading projects...</div>
			</div>

			<div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
				<p class="text-red-600">{{ error }}</p>
			</div>

			<template v-else>
				<div v-if="selectedProject" class="h-full">
					<!-- Project Header -->
					<div class="p-6 border-b border-gray-200 bg-white">
						<div class="flex justify-between items-start">
							<div>
								<h1 class="text-2xl font-bold text-gray-900">
									{{ selectedProject.title }}
								</h1>
								<p class="mt-1 text-gray-500">
									{{ selectedProject.shortDescription || 'No description' }}
								</p>
							</div>
							<button class="p-2 hover:bg-gray-100 rounded-lg">
								<icon-settings class="h-5 w-5 text-gray-500" />
							</button>
						</div>

						<div class="mt-4 flex items-center gap-4 text-sm text-gray-500">
							<div class="flex items-center">
								<icon-calendar class="h-4 w-4 mr-1" />
								Updated {{ new Date(selectedProject.updatedAt).toLocaleDateString() }}
							</div>
							<a>
								:href="selectedProject.url"
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center text-blue-600 hover:text-blue-800"
								>
								<icon-github class="h-4 w-4 mr-1" />
								View on GitHub
							</a>
						</div>
					</div>

					<!-- Project Items -->
					<div class="p-6">
						<div class="grid grid-cols-1 gap-4">
							<div v-for="item in selectedProject.items.nodes" :key="item.id"
								class="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
								<div class="flex items-start justify-between">
									<div>
										<h3 class="font-medium text-gray-900">
											{{ item.content?.title }}
										</h3>
										<div class="mt-1 flex items-center gap-2">
											<span v-if="item.content?.repository" class="text-sm text-gray-500">
												{{ item.content.repository.owner.login }}/{{
													item.content.repository.name }}
											</span>
											<span v-for="label in item.content?.labels?.nodes" :key="label.name"
												class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
												:style="{
													backgroundColor: `#${label.color}20`,
													color: `#${label.color}`
												}">
												<icon-tag class="w-3 h-3 mr-1" />
												{{ label.name }}
											</span>
										</div>
									</div>

									<span v-if="item.content?.state" class="px-2 py-1 rounded text-sm"
										:class="getStatusColor(item.content.state)">
										{{ item.content.state }}
									</span>
								</div>

								<div class="mt-2">
									<div v-for="(fieldValue, index) in item.fieldValues.nodes" :key="index"
										class="text-sm text-gray-600">
										<span class="font-medium">{{ fieldValue.field?.name }}: </span>
										{{ getFieldValue(fieldValue) }}
									</div>
								</div>

								<div v-if="item.content?.assignees?.nodes.length" class="mt-3 flex -space-x-2">
									<img v-for="assignee in item.content.assignees.nodes" :key="assignee.login"
										:src="assignee.avatarUrl" :alt="assignee.login" :title="assignee.login"
										class="w-6 h-6 rounded-full border-2 border-white" />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="flex items-center justify-center h-full text-gray-500">
					Select a project to view details
				</div>
			</template>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore';


// State
const projects = ref([]);
const selectedProject = ref(null);
const loading = ref(false);
const error = ref(null);

// Constants
const STATUS_COLORS = {
	'Todo': 'bg-gray-100',
	'In Progress': 'bg-blue-100',
	'Done': 'bg-green-100',
	'OPEN': 'bg-yellow-100',
	'CLOSED': 'bg-purple-100'
};

// Methods
const loadUserProjects = async () => {
	loading.value = true;
	try {
		const projectStore = useGithubProjectsStore();
		projects.value = await projectStore.fetchUserProjects();
	} catch (err) {
		error.value = err.message;
	} finally {
		loading.value = false;
	}
};

const handleProjectSelect = async (projectId) => {
	loading.value = true;
	try {
		const projectStore = useGithubProjectsStore();
		selectedProject.value = await projectStore.fetchUserProjects(projectId);
	} catch (err) {
		error.value = err.message;
	} finally {
		loading.value = false;
	}
};

const getStatusColor = (status) => {
	return STATUS_COLORS[status] || 'bg-gray-100';
};

const getFieldValue = (fieldValue) => {
	if (fieldValue.text) return fieldValue.text;
	if (fieldValue.name) return fieldValue.name;
	if (fieldValue.date) return new Date(fieldValue.date).toLocaleDateString();
	return '';
};

// Lifecycle
onMounted(() => {
	loadUserProjects();
});
</script>