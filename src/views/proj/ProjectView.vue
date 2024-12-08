<template>
	<div class="container-col">
		<!-- Not Found State -->
		<div v-if="!projects[props.projectId]" class="flex flex-column items-center justify-center p-6">
			<h2>Project Not Found</h2>
			<p class="text-gray-600 mb-4">The requested project could not be found.</p>
			<Button label="Go Back" @click="router.back()" />
		</div>

		<!-- Project Content -->
		<div v-else class="proj-container ph-1rem width-100">
			<!-- Header Section -->
			<div class="container-row header underline-gray width-100">
				<div class="header-left container-row">
					<div class="project-title">
						<h3>{{ projects[props.projectId].proj_name }}</h3>
						<div v-if="projects[props.projectId].vcs_proj_url">
							<a :href="projects[props.projectId].vcs_proj_url" target="_blank" rel="noopener noreferrer"
								@click.prevent="openInPopup">
								Open Project
							</a>
						</div>
					</div>
					<div class="container-row role">
						<img v-if="projects[props.projectId].participation_status === 'OWNER'"
							src="@/assets/icons/Crown.svg" alt="Owner" class="role-icon" />
						<span>{{ projects[props.projectId].participation_status }}</span>
					</div>
				</div>

				<div class="header-right">
					<Button severity="secondary" icon="pi pi-cog" @click="openProjectSettings" aria-haspopup="true"
						aria-controls="overlay-menu" text />
					<Button @click="toggleVcsMenu" icon='pi pi-code' severity="secondary" />
					<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
				</div>
			</div>

			<!-- Workspaces Section -->
			<div class="ph-1rem container-col">
				<div class="container-row header">
					<h3 class="semibold">Workspaces</h3>
					<Button label="New Workspace" icon="pi pi-plus" severity="secondary"
						@click="openNewWorkspaceDialog = true" />
				</div>

				<!-- Workspaces Grid -->
				<div v-if="projects[props.projectId].workspaces?.length" class="workspaces-grid">
					<div v-for="workspace in projects[props.projectId].workspaces" :key="workspace.workspace_id"
						class="workspace-card" @click="navigateToWorkspace(workspace.workspace_id)">
						<Card>
							<template #title>
								{{ workspace.workspace_name }}
								<Button icon="pi pi-code" variant="text" @click.stop="openRepositoryPopup(workspace)"
									v-tooltip.bottom="'go to repository'" />
							</template>
							<template #content>
								<ProgressBar :value="workspace.progress_status" severity="secondary" />
							</template>
						</Card>
					</div>
				</div>

				<!-- Empty State -->
				<div v-else class="empty-state text-center p-6 bg-gray-50 rounded-lg">
					<i class="pi pi-folder-open text-4xl text-gray-400 mb-3" />
					<p class="text-gray-600">No workspaces found. Create a new workspace to get started.</p>
				</div>
			</div>
		</div>

		<!-- Repository Dialog -->
		<Dialog v-model:visible="showRepoDialog" modal header="Repository Link" :style="{ width: '50vw' }">
			<template v-if="selectedWorkspace?.vcs_repo_url">
				<p>Repository URL:</p>
				<a :href="selectedWorkspace.vcs_repo_url" target="_blank" rel="noopener noreferrer"
					@click.prevent="openInPopup" class="repo-link">
					{{ selectedWorkspace.vcs_repo_url }}
				</a>
			</template>
			<template v-else>
				<p>No repository link available for this workspace.</p>
			</template>
		</Dialog>

		<!-- Other Modals -->
		<Dialog v-model:visible="openNewWorkspaceDialog" modal header="새 워크스페이스 생성" :style="{ width: '30rem' }">
			<InputText v-model="newWorkspaceName" type="text" placeholder="워크스페이스 이름 입력" />
			<div class="modal-footer mt-4">
				<Button label="확인" icon="pi pi-check" @click="createWorkspace" class="p-button-primary" />
			</div>
		</Dialog>
		<Toast />
		<ProjectSettingsModal v-model:visible="showProjectSettings" :project-id="projectId"
			:project-data="projects[props.projectId]" @project-updated="handleProjectUpdate"
			@project-deleted="handleProjectDelete" />

		<ProjVcsSettingsModal v-model:visible="showProjVcsSettings" :project-id="projectId"
			:project-data="projects[props.projectId]" @update:project="updateProjectInfo" />
	</div>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue';
	import { storeToRefs } from 'pinia';
	import { useRoute, useRouter } from 'vue-router';
	import { useToast } from 'primevue/usetoast';
	import axios from 'axios';

	import { useAuthStore } from '@/stores/auth';
	import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
	import { useProjectStore } from '@/stores/proj/useProjectStore';

	import Button from 'primevue/button';
	import InputText from 'primevue/inputtext';
	import Dialog from 'primevue/dialog';
	import ProjectSettingsModal from './components/ProjectSettingsModal.vue';
	import ProjVcsSettingsModal from './components/ProjGithubIntegrationModal.vue';
	import VcsTypeMenu from '../vcs/components/VcsTypeMenu.vue';

	// Props definition
	const props = defineProps({
		projectId: {
			type: Number,
			required: true
		}
	});

	// Emits definition
	const emit = defineEmits(['update:project']);

	// Router and Stores
	const router = useRouter();
	const route = useRoute();
	const toast = useToast();
	const githubAuthStore = useGithubAuthStore();
	const authStore = useAuthStore();
	const projectStore = useProjectStore();

	// Store refs
	const { user } = storeToRefs(authStore);
	const { projects } = storeToRefs(projectStore);

	// Component refs
	const vcsMenu = ref(null);
	const showProjectSettings = ref(false);
	const showProjVcsSettings = ref(false);
	const openNewWorkspaceDialog = ref(false);
	const newWorkspaceName = ref('');
	const workspaceDetails = ref(null);
	const showRepoDialog = ref(false);
	const selectedWorkspace = ref(null);

	const fetchWorkspace = async () => {
		workspaceDetails.value = projectStore.getWorkspace(props.projectId, props.workspaceId);
	}

	// Methods
	const navigateToWorkspace = (workspaceId) => {
		router.push({
			name: 'Workspace',
			params: {
				projectId: props.projectId,
				workspaceId
			}
		});
	};

	const openRepositoryPopup = (workspace) => {
		// Log workspace details for debugging
		console.log('Opening repository for workspace:', workspace);

		// Store the selected workspace
		selectedWorkspace.value = workspace;

		// Check if repository URL exists (fixed typo from vsc_repo_url to vcs_repo_url)
		if (workspace.vcs_repo_url) {
			// Show the repository dialog
			showRepoDialog.value = true;
		} else {
			// Show a toast notification if no repository URL is available
			toast.add({
				severity: 'info',
				summary: 'Repository Not Available',
				detail: 'No repository link has been configured for this workspace.',
				life: 3000
			});
		}
	};

	// Update the openInPopup method to handle both project and workspace URLs
	const openInPopup = () => {
		// Get the URL from either the selected workspace or project
		const url = selectedWorkspace.value?.vcs_repo_url || projects.value[props.projectId]?.vcs_proj_url;

		if (!url) {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Repository URL is not available.',
				life: 3000
			});
			return;
		}

		// Calculate center position for the popup
		const width = 800;
		const height = 600;
		const left = (window.screen.width / 2) - (width / 2);
		const top = (window.screen.height / 2) - (height / 2);

		// Open repository in a new popup window
		const popup = window.open(
			url,
			'RepositoryWindow',
			`width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
		);

		// Check if popup was blocked
		if (!popup || popup.closed || typeof popup.closed === 'undefined') {
			toast.add({
				severity: 'warn',
				summary: 'Popup Blocked',
				detail: 'Please allow popups for this site to open the repository.',
				life: 5000
			});
		}
	};

	const toggleVcsMenu = (event) => {
		vcsMenu.value?.toggle(event);
	};

	const openProjectSettings = () => {
		showProjectSettings.value = true;
	};

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

	const createWorkspace = async () => {
		if (!newWorkspaceName.value.trim()) {
			toast.add({
				severity: 'warn',
				summary: '이름 입력 필요',
				detail: '워크스페이스 이름을 입력해주세요.',
				life: 3000
			});
			return;
		}

		try {
			const response = await axios.post('/workspaces', {
				workspace_name: newWorkspaceName.value.trim(),
				proj_id: props.projectId
			});

			if (response.data.success) {
				await projectStore.fetchProjects(); // Refresh projects data

				toast.add({
					severity: 'success',
					summary: '워크스페이스 생성',
					detail: `워크스페이스 '${newWorkspaceName.value}'가 생성되었습니다.`,
					life: 3000
				});

				openNewWorkspaceDialog.value = false;
				newWorkspaceName.value = '';
			}
		} catch (error) {
			console.error('워크스페이스 생성 실패:', error);
			toast.add({
				severity: 'error',
				summary: '워크스페이스 생성 실패',
				detail: '워크스페이스 생성 중 오류가 발생했습니다.',
				life: 3000
			});
		}
	};


</script>

<style scoped>
	.role {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.role img {
		width: 1.5rem;
		height: 1.5rem;
	}

	.role span {
		color: var(--muted-text-color);
	}

	.workspaces-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.workspace-card {
		border-radius: 1.2rem;
		transition: transform 0.2s ease;
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

	.repo-link {
		color: var(--primary-color);
		text-decoration: none;
		word-break: break-all;
	}

	.repo-link:hover {
		text-decoration: underline;
	}
</style>