<template>
	<div v-if="project" class="p-6">
		<header class="mb-8">
			<div class="flex justify-between items-center mb-4">
				<h1 class="text-2xl font-bold">{{ project.proj_name }}</h1>
				<div class="flex gap-2">
					<Button :icon="project.bookmark_status === 'BOOKMARKED' ? 'pi pi-star-fill' : 'pi pi-star'"
						@click="toggleBookmark"
						:class="{ 'text-yellow-500': project.bookmark_status === 'BOOKMARKED' }" />
					<Button icon="pi pi-cog" @click="showSettings = true" />
				</div>
			</div>

			<div class="flex gap-4 text-sm text-gray-600">
				<div>
					<i class="pi pi-calendar mr-2" />
					{{ formatDateRange(project.start_time, project.end_time) }}
				</div>
				<div>
					<i class="pi pi-chart-bar mr-2" />
					진행률: {{ project.progress_status }}%
				</div>
				<div v-if="project.vcs_type">
					<i :class="`pi ${getVcsIcon(project.vcs_type)} mr-2`" />
					{{ project.vcs_type }}
				</div>
			</div>
		</header>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<!-- Project Stats Card -->
			<Card class="shadow-sm">
				<template #title>Project Overview</template>
				<template #content>
					<div class="space-y-4">
						<ProgressBar :value="project.progress_status" />
						<div class="flex justify-between text-sm">
							<span>Workspaces: {{ project.workspaces.length }}</span>
							<span>Created: {{ formatDate(project.created_at) }}</span>
						</div>
					</div>
				</template>
			</Card>

			<!-- Workspaces List Card -->
			<Card class="shadow-sm">
				<template #title>Workspaces</template>
				<template #content>
					<div class="space-y-2">
						<div v-for="workspace in project.workspaces" :key="workspace.workspace_id"
							class="p-2 border rounded hover:bg-gray-50 cursor-pointer"
							@click="navigateToWorkspace(workspace.workspace_id)">
							<div class="flex justify-between items-center">
								<span>{{ workspace.workspace_name }}</span>
								<span class="text-sm text-gray-600">{{ workspace.progress_status }}%</span>
							</div>
						</div>
						<Button label="New Workspace" icon="pi pi-plus" class="w-full mt-4"
							@click="showNewWorkspaceModal = true" />
					</div>
				</template>
			</Card>

			<!-- VCS Info Card -->
			<Card v-if="project.vcs_type" class="shadow-sm">
				<template #title>Version Control</template>
				<template #content>
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<i :class="`pi ${getVcsIcon(project.vcs_type)}`" />
							<span>{{ project.vcs_type }}</span>
						</div>
						<div v-if="project.vcs_proj_url" class="text-sm break-all">
							<a :href="project.vcs_proj_url" target="_blank" class="text-blue-600 hover:underline">
								{{ project.vcs_proj_url }}
							</a>
						</div>
					</div>
				</template>
			</Card>
		</div>

		<!-- Settings Dialog -->
		<Dialog v-model:visible="showSettings" header="Project Settings" :modal="true">
			<ProjectSettingsForm :project="project" @submit="handleSettingsSubmit" @delete="handleProjectDelete" />
		</Dialog>

		<!-- New Workspace Dialog -->
		<Dialog v-model:visible="showNewWorkspaceModal" header="New Workspace" :modal="true">
			<NewWorkspaceForm :projectId="project.proj_id" @submit="handleNewWorkspace" />
		</Dialog>
	</div>
	<div v-else class="flex justify-center items-center h-full">
		<ProgressSpinner v-if="isLoading" />
		<div v-else class="text-gray-500">Project not found</div>
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue';
	import { useRoute, useRouter } from 'vue-router';
	import { storeToRefs } from 'pinia';
	import { useProjectStore } from '@/stores/proj/useProjectStore';
	import { useToast } from 'primevue/usetoast';
	import Card from 'primevue/card';
	import Dialog from 'primevue/dialog';
	import ProgressBar from 'primevue/progressbar';
	import ProgressSpinner from 'primevue/progressspinner';
	// import ProjectSettingsForm from './components/ProjectSettingsForm.vue';
	// import NewWorkspaceForm from './components/NewWorkspaceForm.vue';

	const route = useRoute();
	const router = useRouter();
	const toast = useToast();
	const projectStore = useProjectStore();

	const { isLoading } = storeToRefs(projectStore);
	const showSettings = ref(false);
	const showNewWorkspaceModal = ref(false);

	const project = computed(() => {
		return projectStore.getProjectById(parseInt(route.params.projectId));
	});

	const getVcsIcon = (vcsType) => {
		return vcsType === 'GITHUB' ? 'pi-github' : 'pi-gitlab';
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatDateRange = (startDate, endDate) => {
		return `${formatDate(startDate)} - ${formatDate(endDate)}`;
	};

	const navigateToWorkspace = (workspaceId) => {
		router.push({
			name: 'Workspace',
			params: {
				projectId: project.value.proj_id,
				workspaceId
			}
		});
	};

	const toggleBookmark = async () => {
		try {
			const newStatus = project.value.bookmark_status === 'BOOKMARKED' ? 'NONE' : 'BOOKMARKED';
			await projectStore.updateProject(project.value.proj_id, {
				bookmark_status: newStatus
			});

			toast.add({
				severity: 'success',
				summary: '북마크 업데이트',
				detail: '북마크 상태가 변경되었습니다.',
				life: 3000
			});
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: '업데이트 실패',
				detail: '북마크 상태 변경에 실패했습니다.',
				life: 3000
			});
		}
	};

	const handleSettingsSubmit = async (updatedData) => {
		try {
			await projectStore.updateProject(project.value.proj_id, updatedData);
			showSettings.value = false;

			toast.add({
				severity: 'success',
				summary: '설정 업데이트',
				detail: '프로젝트 설정이 업데이트되었습니다.',
				life: 3000
			});
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: '업데이트 실패',
				detail: error.message || '프로젝트 설정 업데이트에 실패했습니다.',
				life: 3000
			});
		}
	};

	const handleProjectDelete = async () => {
		try {
			await projectStore.deleteProject(project.value.proj_id);
			router.push({ name: 'Projects' });

			toast.add({
				severity: 'success',
				summary: '프로젝트 삭제',
				detail: '프로젝트가 삭제되었습니다.',
				life: 3000
			});
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: '삭제 실패',
				detail: error.message || '프로젝트 삭제에 실패했습니다.',
				life: 3000
			});
		}
	};

	const handleNewWorkspace = async (workspaceData) => {
		try {
			await projectStore.addWorkspace(project.value.proj_id, workspaceData);
			showNewWorkspaceModal.value = false;

			toast.add({
				severity: 'success',
				summary: '워크스페이스 생성',
				detail: '새 워크스페이스가 생성되었습니다.',
				life: 3000
			});
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: '생성 실패',
				detail: error.message || '워크스페이스 생성에 실패했습니다.',
				life: 3000
			});
		}
	};

	onMounted(() => {
		if (!project.value) {
			router.push({ name: 'Projects' });
		}
	});
</script>