<template>
	<div class="container-col">
		<!-- Not Found State -->
		<div v-if="!currentProject" class="flex flex-column items-center justify-center p-6">
			<h2>Project Not Found</h2>
			<p class="text-gray-600 mb-4">The requested project could not be found.</p>
			<Button label="Go Back" @click="router.back()" />
		</div>

		<!-- Project Content -->
		<div v-else class="proj-container">

			<!-- Header Section -->
			<div class="container-row proj-header underline-gray">

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
					<Button label="settings" severity="secondary" icon="pi pi-cog" @click="openProjectSettings"
						aria-haspopup="true" aria-controls="overlay-menu" />
				</div>
			</div>

			<!-- Workspaces Section -->
			<div class="workspaces-container container-col">

				<!-- workspaces-header -->
				<div class="container-row workspaces-header">
					<h3 class="semibold">Workspaces</h3>
					<Button label="New Workspace" icon="pi pi-plus" severity="secondary"
						@click="openNewWorkspaceDialog" />
				</div>

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

		<!-- Modals -->
		<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />

		<GithubAuthModal :visible="showGithubAuthModal" @update:visible="showGithubAuthModal = $event"
			@login-success="handleGithubLoginSuccess" @login-error="handleGithubLoginError" />


		<OrgSelectMenu v-model:visible="showOrgProjSelectionModal" @select="handleProjectSelect" />


		<ProjectSettingsModal v-model:visible="showProjectSettings" :projectId="props.projectId"
			:projectData="currentProject" @project-updated="handleProjectUpdate"
			@project-deleted="handleProjectDelete" />
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
import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';
import GithubAuthModal from '@/views/vcs/github/GithubAuthModal.vue';
import OrgSelectMenu from '../vcs/github/OrgSelectMenu.vue';
import ProjectSettingsModal from './components/ProjectSettingsModal.vue';
// props
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

// Router and Stores
const router = useRouter();
const toast = useToast();
const githubAuthStore = useGithubAuthStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// Refs
const vcsMenu = ref(null);
const showGithubAuthModal = ref(false);
const showOrgProjSelectionModal = ref(false);
const showProjectSettings = ref(false);
// Computed
const currentProject = computed(() =>
	props.projects.find(p => p.proj_id === parseInt(props.projectId))
);

// Navigation Methods
const navigateToWorkspace = (workspaceId) => {
	router.push({
		name: 'Workspace',
		params: { projectId: props.projectId, workspaceId }
	});
};

// VCS Integration Methods
const openVcsMenu = (event) => {
	vcsMenu.value?.toggle(event);
};

const openProjectSettings = (project) => {
	showProjectSettings.value = true;
}


const handleVcsSelection = async (vcsType) => {
	try {
		if (vcsType === 'GITHUB') {
			if (!githubAuthStore.isAuthenticated) {
				showGithubAuthModal.value = true;
			} else {
				showOrgProjSelectionModal.value = true;
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
const handleProjectUpdate = (updatedProject) => {
	const index = projects.value.findIndex(p => p.proj_id === updatedProject.proj_id);
	if (index !== -1) {
		projects.value[index] = { ...projects.value[index], ...updatedProject };
	}
};

const handleProjectDelete = (projectId) => {
	projects.value = projects.value.filter(p => p.proj_id !== projectId);
	router.push('/');
};
const handleGithubLoginSuccess = () => {
	showGithubAuthModal.value = false;
	showOrgProjSelectionModal.value = true;
};

const handleGithubLoginError = (error) => {
	toast.add({
		severity: 'error',
		summary: 'GitHub Authentication Failed',
		detail: error.message,
		life: 3000
	});
};

// const handleProjectUpdate = (updatedProject) => {
// 	// Emit event to update parent state
// 	emit('update:project', updatedProject);
// 	showOrgProjSelectionModal.value = false;
// };

// Update the handleProjectSelect method in ProjectView.vue

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
// Event emits
const emit = defineEmits(['update:project']);
</script>

<style scoped>
.proj-container {
	padding: 1rem;
}

.proj-header {
	gap: 2rem;
}



.role {}

.role img {
	width: 1.5rem;
	height: 1.5rem;
}

.role span {
	color: var(--muted-text-color);

}

.header-right {
	align-items: center;
	margin-right: 3rem;
}



/* Workspace Styles */

.workspaces-container {
	padding: 1rem;
}

.workspaces-header>.container-row {
	gap: 1rem;
	justify-content: center;
}

.workspaces-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 1rem;
}


.workspace-card {
	margin: 1rem;
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