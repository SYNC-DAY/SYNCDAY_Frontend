<template>
	<div class="proj-container">
		<div class="container-column">
			<!-- Loading State -->
			<div v-if="isLoading" class="container-row">
				<ProgressSpinner />
			</div>

			<!-- Not Found State -->
			<div v-else-if="!currentProject" class="container-column">
				<h2 class="text-xl font-bold mb-2">Project Not Found</h2>
				<p class="text-gray-600 mb-4">The requested project could not be found.</p>
				<Button label="Go Back" @click="router.back()" />
			</div>

			<!-- Project Content -->
			<div v-else class="container-column">

				<!-- Project Header -->
				<div class="proj-header underline-gray container-row width-100">
					<div class="container-row">
						<!-- Header Left -->
						<div class="container-row header-left">
							<!-- Project Title -->
							<div class="proj-title">
								<a v-if="currentProject.vcs_proj_url" :href="currentProject.vcs_proj_url"
									target="_blank" class="container-row">
									<h2>{{ currentProject.proj_name }}</h2>
								</a>
								<h2 v-else>{{ currentProject.proj_name }}</h2>
							</div>

							<!-- Project Role -->
							<div class="proj-role container-row">
								<img v-if="currentProject.participation_status === 'OWNER'"
									src="@/assets/icons/Crown.svg" alt="Owner" class="role-icon" />
								<span>{{ currentProject.participation_status }}</span>
							</div>

							<!-- VCS Integration -->
							<div v-if="currentProject.vcs_type" class="container-row">
								<VcsInfo :project="currentProject" />
							</div>
						</div>
					</div>
					<!-- Header Right Settings -->
					<div class="container-row header-right">
						<Button icon="pi pi-cog" class="p-button-text" @click="openProjSettingsModal" />
					</div>

				</div>

				<!-- Workspaces Section -->
				<div class="workspaces-section mt-6">
					<div class="container-row mb-4">
						<h3 class="text-lg font-semibold">Workspaces</h3>
						<Button label="New Workspace" icon="pi pi-plus" severity="secondary"
							@click="openNewWorkspaceDialog" />
					</div>

					<!-- Workspaces Grid -->
					<div v-if="currentProject.workspaces?.length" class="workspaces-grid">
						<div v-for="workspace in currentProject.workspaces" :key="workspace.workspace_id"
							class="workspace-card" @click="navigateToWorkspace(workspace.workspace_id)">
							<h4 class="workspace-title">{{ workspace.workspace_name }}</h4>
							<div class="progress-bar-bg">
								<div class="progress-bar-fill" :style="{ width: `${workspace.progress_status}%` }">
								</div>
							</div>
							<span class="progress-text">{{ workspace.progress_status }}% Complete</span>
						</div>
					</div>

					<!-- Empty State -->
					<div v-else class="empty-state container-column">
						<i class="pi pi-folder-open"></i>
						<p>No workspaces found. Create a new workspace to get started.</p>
					</div>
				</div>

				<!-- Modals -->
				<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />

				<GithubAuthModal v-model:visible="showGithubAuthModal" @login-success="handleGithubLoginSuccess"
					@login-error="handleGithubLoginError" />

				<GithubOrgModal :is-open="showGithubOrgModal" :project-id="props.projectId"
					@close="showGithubOrgModal = false" @update:project="handleProjectUpdate" />
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';
import GithubOrgModal from '@/views/vcs/github/GithubOrgModal.vue';
import GithubAuthModal from '@/views/vcs/github/GithubAuthModal.vue';
import VcsInfo from './VcsInfo.vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';

const props = defineProps({
	projectId: {
		type: [String, Number],
		required: true
	},
	projects: {
		type: Array,
		required: true
	}
});

const router = useRouter();
const toast = useToast();
const authStore = useGithubAuthStore();
const emit = defineEmits(['update:project']);

const vcsMenu = ref(null);
const showGithubAuthModal = ref(false);
const showGithubOrgModal = ref(false);
const isLoading = ref(false);

const currentProject = computed(() =>
	props.projects.find(p => p.proj_id === parseInt(props.projectId))
);

const navigateToWorkspace = (workspaceId) => {
	router.push({
		name: 'Workspace',
		params: { projectId: props.projectId, workspaceId }
	});
};

const navigateToSettings = () => {
	router.push({
		name: 'ProjectSettings',
		params: { projectId: props.projectId }
	});
};

const openVcsMenu = (event) => {
	vcsMenu.value?.toggle(event);
};

const handleVcsSelection = async (vcsType) => {
	try {
		if (vcsType === 'GITHUB') {
			if (!authStore.isAuthenticated) {
				showGithubAuthModal.value = true;
			} else {
				showGithubOrgModal.value = true;
			}
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

const handleGithubLoginSuccess = () => {
	showGithubAuthModal.value = false;
	showGithubOrgModal.value = true;
};

const handleGithubLoginError = (error) => {
	toast.add({
		severity: 'error',
		summary: 'GitHub Authentication Failed',
		detail: error.message,
		life: 3000
	});
};

const handleProjectUpdate = (updatedProject) => {
	emit('update:project', updatedProject);
	showGithubOrgModal.value = false;
	toast.add({
		severity: 'success',
		summary: 'GitHub Connected',
		detail: `Successfully connected to ${updatedProject.vcs_metadata?.org_name}`,
		life: 3000
	});
};

const openNewWorkspaceDialog = () => {
	// Implementation for opening new workspace dialog
};
</script>

<style scoped>
.proj-container {
	padding: 1rem;
}

.proj-header {
	width: 100%;
}

.header-left {
	flex: 1;
	gap: 1rem;
	min-width: 0;
	/* Prevents flex item from overflowing */
	display: flex;
	align-items: center;
}

.proj-title {
	flex: 1;
}

.proj-role {
	justify-content: center;
	gap: 0.5rem;
}

.proj-role img {
	width: 2rem;
	height: 2rem;
}

.proj-role span {
	color: var(--muted-text-color);
}

.header-right {
	flex: 1;
	width: auto;
	justify-content: center;
}

.header-right button {
	size: 2rem;
}

.workspaces-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 1rem;
}

.workspace-card {
	padding: 1rem;
	background: white;
	border: 1px solid var(--outline-gray);
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s ease-in-out;
}

.workspace-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.workspace-title {
	margin: 0 0 0.5rem 0;
	font-size: 1rem;
	font-weight: 500;
}

.progress-bar-bg {
	width: 100%;
	height: 0.5rem;
	background-color: var(--outline-gray);
	border-radius: 0.25rem;
	margin-bottom: 0.5rem;
}

.progress-bar-fill {
	height: 100%;
	background: var(--pink-color);
	border-radius: 0.25rem;
	transition: width 0.3s ease;
}

.progress-text {
	font-size: 0.875rem;
	color: var(--muted-text-color);
}

.empty-state {
	padding: 3rem;
	text-align: center;
	background: var(--background-color);
	border-radius: 0.5rem;
}

.empty-state i {
	font-size: 2.5rem;
	color: var(--muted-text-color);
	margin-bottom: 1rem;
}

.empty-state p {
	color: var(--muted-text-color);
}
</style>