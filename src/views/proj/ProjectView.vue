<template>
	<div class="container-col">
		<!-- Not Found State -->
		<div v-if="!currentProject" class="flex flex-column items-center justify-center p-6">
			<h2>Project Not Found</h2>
			<p class="text-gray-600 mb-4">The requested project could not be found.</p>
			<Button label="Go Back" @click="router.back()" />
		</div>

		<!-- Project Content -->
		<div v-else class="proj-container ph-1rem">

			<!-- Header Section -->
			<div class="container-row header underline-gray">

				<!-- header-left -->
				<div class="header-left container-row">
					<div class="project-title">
						<h3>{{ currentProject.proj_name }}</h3>
					</div>
					<div class="container-row role">
						<img v-if="currentProject.participation_status === 'OWNER'" src="@/assets/icons/Crown.svg"
							alt="" class="role-icon" />
						<span>{{ currentProject.participation_status }}</span>
					</div>
				</div>

				<div class="header-right">
					<Button label="" severity="secondary" icon="pi pi-cog" @click="openProjectSettings"
						aria-haspopup="true" aria-controls="overlay-menu" text />

					<Button label="" @click="toggleVcsMenu" icon='pi pi-code' severity=""> </Button>
					<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
				</div>
			</div>

			<!-- Workspaces Section -->
			<div class="ph-1rem container-col">

				<!-- workspaces-header -->
				<div class="container-row header">
					<h3 class="semibold">Workspaces</h3>
					<Button label="New Workspace" icon="pi pi-plus" severity="secondary"
						@click="() => { openNewWorkspaceDialog = true }" />
				</div>

				<!-- New Workspace Modal -->
				<Dialog :visible="openNewWorkspaceDialog" @update:visible="openNewWorkspaceDialog = $event" modal
					header="새 워크스페이스 생성" :style="{ width: '30rem' }">
					<!-- <div> -->

					<InputText type="text" v-model="newWorkspaceName" placeholder="워크스페이스 이름 입력" />
					<!-- </div> -->

					<div class="modal-footer mt-4">
						<!-- <Button label="취소" icon="pi pi-times" @click="openNewWorkspaceDialog = false" class="p-button-text" /> -->
						<Button label="확인" icon="pi pi-check" @click="createWorkspace" class="p-button-primary" />
					</div>
				</Dialog>


				<!-- Workspaces Grid -->
				<div v-if="currentProject.workspaces?.length" class="workspaces-grid">
					<div v-for="workspace in currentProject.workspaces" :key="workspace.workspace_id"
						class="workspace-card" @click="navigateToWorkspace(workspace.workspace_id)">
						<Card style="">
							<template #title>{{ workspace.workspace_name }} <Button icon="pi pi-github"
									variant="text"></Button>
							</template>
							<template #content>
								<ProgressBar :value="workspace.progress_status" severity="secondary" style="" />

							</template>
						</Card>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else class="empty-state text-center p-6 bg-gray-50 rounded-lg">
					<i class="pi pi-folder-open text-4xl text-gray-400 mb-3"></i>
					<p class="text-gray-600">No workspaces found. Create a new workspace to get started.</p>
				</div>
			</div>
		</div>





		<ProjectSettingsModal v-model:visible="showProjectSettings" :projectId="props.projectId"
			:projectData="currentProject" @project-updated="handleProjectUpdate"
			@project-deleted="handleProjectDelete" />

		<ProjVcsSettingsModal v-model:visible="showProjVcsSettings" :projectId="props.projectId"
			:projectData="currentProject" @update:projectInfo="(newValue) => projData = newValue" />


		<template>
		</template>

	</div>
</template>

<script setup>
	import axios from 'axios';
	import { storeToRefs } from 'pinia';
	import { ref, computed } from 'vue';
	import { useAuthStore } from '@/stores/auth';
	import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
	import { useRouter } from 'vue-router';
	import { useToast } from 'primevue/usetoast';
	import Button from 'primevue/button';
	import InputText from 'primevue/inputtext';
	import ProjectSettingsModal from './components/ProjectSettingsModal.vue';
	import ProjVcsSettingsModal from './components/ProjGithubIntegrationModal.vue';
	import VcsTypeMenu from '../vcs/components/VcsTypeMenu.vue';

	// props
	const props = defineProps({
		projectId: {
			type: [String, Number],
			required: true
		},
		proj: {
			type: Object,
			required: true
		}
	});

	// Router and Stores
	const router = useRouter();
	const toast = useToast();
	const githubAuthStore = useGithubAuthStore();
	const authStore = useAuthStore();
	const { user } = storeToRefs(authStore);

	// Refs
	const projects = ref([]);
	const vcsMenu = ref(null);
	const showProjectSettings = ref(false);
	const showProjVcsSettings = ref(false);
	const openNewWorkspaceDialog = ref(false);
	const newWorkspaceName = ref('');

	// Computed
	// Navigation Methods
	const navigateToWorkspace = (workspaceId) => {
		router.push({
			name: 'Workspace',
			params: { projectId: props.projectId, workspaceId }
		});
	};

	// VCS Integration Methods
	const toggleVcsMenu = (event) => {
		vcsMenu.value.toggle(event);
	};

	const openProjectSettings = (project) => {
		showProjectSettings.value = true;
	}

	const handleVcsSelection = async (vcsType) => {
		try {
			if (vcsType === 'GITHUB') {
				showProjVcsSettings.value = true;
			}
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: 'VCS Connection Failed',
				detail: error.message,
				life: 3000
			});
		}
	};



	const handleProjectUpdate = (updatedProject) => {
		const index = props.projects.findIndex((p) => p.proj_id === updatedProject.proj_id);
		if (index !== -1) {
			props.projects[index] = { ...props.projects[index], ...updatedProject }; // 데이터 업데이트
		} else {
			console.error(`Project with ID ${updatedProject.proj_id} not found.`);
		}
	};


	const handleProjectDelete = (projectId) => {
		projects.value = projects.value.filter(p => p.proj_id !== projectId);
		router.push('/');
	};






	const handleProjectSelect = async ({ organization }) => {
		try {
			// First, construct the organization URL
			const orgUrl = `https://github.com/${organization.login}`;

			// Make the axios request to update the project's VCS information
			const response = await axios.put("/projs/vcs", {
				user_id: user.value.userId,
				proj_id: props.projectId,
				vcs_type: 'GITHUB',
				vcs_proj_url: orgUrl
			});

			if (!response.data.success) {
				throw new Error(response.data.error || 'Failed to update VCS information');
			}

			// Update the local project state
			const updatedProject = {
				...currentProject.value,
				vcs_type: 'GITHUB',
				vcs_proj_url: orgUrl
			};

			// Emit the update event to refresh the parent component
			emit('update:project', updatedProject);

			// Show success toast
			toast.add({
				severity: 'success',
				summary: 'VCS Updated',
				detail: `Successfully connected to GitHub organization: ${organization.login}`,
				life: 3000
			});

			// Close the organization selection modal
			showOrgProjSelectionModal.value = false;

		} catch (error) {
			console.error('Failed to update VCS information:', error);

			// Show error toast
			toast.add({
				severity: 'error',
				summary: 'Update Failed',
				detail: error.message || 'Failed to update VCS information',
				life: 3000
			});
		}
	};

	const createWorkspace = async () => {
		console.log("확인 버튼 클릭됨");
		if (!newWorkspaceName.value.trim()) {
			toast.add({
				severity: "warn",
				summary: "이름 입력 필요",
				detail: "워크스페이스 이름을 입력해주세요.",
				life: 3000,
			});
			return;
		}

		try {
			const response = await axios.post("/workspaces", {
				workspace_name: newWorkspaceName.value.trim(),
				proj_id: currentProject.value.proj_id,
			});
			console.log("현재 프로젝트id: ", currentProject.value);
			console.log("새로운 워크스페이스 이름: ", newWorkspaceName.value);
			if (response.data.success) {

				const newWorkspace = response.data.data; // API 응답에서 새 워크스페이스 정보 가져오기
				currentProject.value.workspaces.push(newWorkspace);
				toast.add({
					severity: "success",
					summary: "워크스페이스 생성",
					detail: `워크스페이스 '${newWorkspaceName.value}'가 생성되었습니다.`,
					life: 3000,
				});

				alert(`워크스페이스 '${newWorkspaceName.value}'가 성공적으로 생성되었습니다!`);
				openNewWorkspaceDialog.value = false; // 모달 닫기
				newWorkspaceName.value = ""; // 입력 필드 초기화
			}
		} catch (error) {
			console.error("워크스페이스 생성 실패:", error);
			toast.add({
				severity: "error",
				summary: "워크스페이스 생성 실패",
				detail: "워크스페이스 생성 중 오류가 발생했습니다.",
				life: 3000,
			});
		}
	};
	// Event emits
	const emit = defineEmits(['update:project']);
</script>

<style scoped>
	.role {}

	.role img {
		width: 1.5rem;
		height: 1.5rem;
	}

	.role span {
		color: var(--muted-text-color);

	}




	/* Workspace Styles */



	.workspaces-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-gap: 1rem;
	}


	.workspace-card {
		border-radius: 1.2rem;
		/* border: 0 solid #e5e7; */
		gap: 2rem;

	}

	.workspace-card:hover {
		transform: translateY(-2px);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 200px;
	}
</style>