<template>
	<SideBar>
		<!-- Loading state -->
		<div
			v-if="isLoading"
			class="p-4">
			<ProgressSpinner />
		</div>

		<!-- Error state -->
		<div
			v-else-if="error"
			class="p-4 text-red-600">
			{{ error }}
			<Button
				label="Retry"
				icon="pi pi-refresh"
				@click="handleRetryLoad" />
		</div>

		<!-- Empty state -->
		<div
			v-else-if="!hasProjects"
			class="p-4">
			<p class="text-gray-500 mb-4">No projects available</p>
			<Button
				label="New Project"
				icon="pi pi-plus"
				@click="showNewProjModal = true" />
		</div>

		<!-- Projects list -->
		<template v-else>
			<template
				v-for="project in projects"
				:key="project.proj_id">
				<ProjItem
					:proj="project"
					:isActive="project.proj_id === activeProjectId"
					:isExpanded="expandedProjects.includes(project.proj_id)"
					:projId="project.proj_id"
					:userId="userId"
					@toggle-expansion="toggleProjectExpansion(project.proj_id)"
					@select="selectProject(project.proj_id)">
					<template
						v-for="workspace in project.workspaces"
						:key="workspace.workspace_id">
						<WorkspaceItem
							:workspaceId="workspace.workspace_id"
							:projectId="project.proj_id"
							:title="workspace.workspace_name"
							:isActive="workspace.workspace_id === activeWorkspaceId"
							:progress="workspace.progress_status"
							:initialBookmarked="workspace.bookmark_status === 'BOOKMARKED'"
							@select="selectWorkspace(project.proj_id, workspace.workspace_id)" />
					</template>
				</ProjItem>
			</template>

			<div class="container-row justify-center p-4">
				<Button
					label="New Project"
					icon="pi pi-plus"
					@click="showNewProjModal = true" />
			</div>
		</template>
	</SideBar>

	<NewProjModal
		v-model:visible="showNewProjModal"
		@submit="handleProjectSubmit" />

	<div class="proj-main">
		<router-view />
	</div>
</template>

<script setup>
	import { ref, onMounted, onUnmounted, computed, provide, inject } from "vue";
	import { useRouter } from "vue-router";
	import { storeToRefs } from "pinia";
	import { useProjectStore } from "@/stores/proj/useProjectStore";
	import { useAuthStore } from "@/stores/auth";
	import { useToast } from "primevue/usetoast";

	// Components
	import ProgressSpinner from "primevue/progressspinner";
	import NewProjModal from "./components/NewProjModal.vue";
	import SideBar from "@/components/SideBar.vue";
	import ProjItem from "./sidebar/ProjItem.vue";
	import WorkspaceItem from "./sidebar/WorkspaceItem.vue";

	// Store setup
	const projectStore = useProjectStore();
	const authStore = useAuthStore();
	const router = useRouter();
	const toast = useToast();

	// Destructure store properties with storeToRefs for reactivity
	const { projects, isLoading, error, activeProjectId, activeWorkspaceId, hasProjects } = storeToRefs(projectStore);

	const { user } = storeToRefs(authStore);
	const userId = user.value.userId;

	// Local state
	const expandedProjects = ref([]);
	const showNewProjModal = ref(false);

	// Provide active IDs to child components
	provide("userId", userId);
	provide("activeProjectId", activeProjectId);
	provide("activeWorkspaceId", activeWorkspaceId);

	// Bookmark handling methods

	// Existing methods
	const handleRetryLoad = async () => {
		try {
			await projectStore.initializeStore(userId);
		} catch (error) {
			toast.add({
				severity: "error",
				summary: "로드 실패",
				detail: "프로젝트를 불러오는데 실패했습니다.",
				life: 3000,
			});
		}
	};

	const handleProjectSubmit = async projectData => {
		try {
			await projectStore.createProject({
				userId: userId.value,
				projectData,
			});

			showNewProjModal.value = false;

			toast.add({
				severity: "success",
				summary: "프로젝트 생성 성공",
				detail: "새 프로젝트가 생성되었습니다.",
				life: 3000,
			});
		} catch (error) {
			toast.add({
				severity: "error",
				summary: "프로젝트 생성 실패",
				detail: error.message || "프로젝트 생성 중 오류가 발생했습니다.",
				life: 3000,
			});
		}
	};

	const selectProject = async projId => {
		try {
			projectStore.setActiveProject(projId);
			await router.push({
				name: "Project",
				params: { projectId: projId },
			});
		} catch (err) {
			toast.add({
				severity: "error",
				summary: "이동 실패",
				detail: "프로젝트로 이동하는 중 오류가 발생했습니다.",
				life: 3000,
			});
		}
	};

	const selectWorkspace = async (projId, workspaceId) => {
		try {
			projectStore.setActiveWorkspace(projId, workspaceId);
			await router.push({
				name: "Workspace",
				params: {
					projectId: projId,
					workspaceId: workspaceId,
				},
			});
		} catch (err) {
			toast.add({
				severity: "error",
				summary: "이동 실패",
				detail: "워크스페이스로 이동하는 중 오류가 발생했습니다.",
				life: 3000,
			});
		}
	};

	const toggleProjectExpansion = projId => {
		const index = expandedProjects.value.indexOf(projId);
		if (index === -1) {
			expandedProjects.value.push(projId);
		} else {
			expandedProjects.value.splice(index, 1);
		}
	};

	// Lifecycle hooks
	onMounted(async () => {
		await handleRetryLoad();
	});

	onUnmounted(() => {
		projectStore.clearActiveStates();
	});
</script>

<style scoped>
	.loading-spinner {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
	}

	.proj-main {
		flex: 1;
	}
</style>
