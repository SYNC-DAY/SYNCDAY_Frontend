<template>
	<div class="project-view">
		<!-- Not Found State -->
		<div v-if="!currentProject" class="flex flex-column items-center justify-center p-6">
			<h2>Project Not Found</h2>
			<p class="text-gray-600 mb-4">The requested project could not be found.</p>
			<Button label="Go Back" @click="router.back()" />
		</div>

		<!-- Project Content -->
		<div v-else class="container-column gap-4 p-4">
			<!-- Header Section -->
			<div class="container-column">
				<div class="container-row gap-4">
					<div class="project-title">
						<h2 class="text-xl font-bold m-0">{{ currentProject.proj_name }}</h2>
					</div>
					<div class="flex items-center gap-2">
						<i class="pi pi-crown text-yellow-500"></i>
						<span class="text-gray-600">Owner</span>
					</div>
					<!-- VCS Integration -->

					<div class="flex items-center gap-3">
						<div class="flex items-center gap-3">
							<VcsInfo v-if="currentProject.vcs_type" :vcsType="currentProject.vcs_type"
								:vcsMetadata="currentProject.vcs_metadata" :vcsProjUrl="currentProject.vcs_proj_url" />
							<Button :label="currentProject.vcs_type ? 'Change Organization' : 'Connect to GitHub'"
								severity="secondary" icon="pi pi-building" @click="openVcsMenu" aria-haspopup="true"
								aria-controls="overlay-menu" />
						</div>
					</div>
				</div>

				<!-- VCS Integration -->


				<!-- Workspaces Section -->
				<div class="workspaces-section mt-6">
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-lg font-semibold m-0">Workspaces</h3>
						<Button label="New Workspace" icon="pi pi-plus" severity="secondary"
							@click="openNewWorkspaceDialog" />
					</div>

					<!-- Workspaces Grid -->
					<div v-if="currentProject.workspaces?.length"
						class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						<div v-for="workspace in currentProject.workspaces" :key="workspace.workspace_id"
							class="workspace-card p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
							@click="navigateToWorkspace(workspace.workspace_id)">
							<h4 class="text-md font-medium mb-2">{{ workspace.workspace_name }}</h4>
							<div class="bg-gray-200 rounded-full h-2 mb-2">
								<div class="bg-primary h-full rounded-full"
									:style="{ width: `${workspace.progress_status}%` }"></div>
							</div>
							<span class="text-sm text-gray-600">{{ workspace.progress_status }}% Complete</span>
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

			<GithubOrgModal :is-open="showGithubOrgModal" :project-id="props.projectId" @close="showOrgModal = false"
				@update:project="handleProjectUpdate" />

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
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import VcsInfo from './VcsInfo.vue';
// Props
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
const authStore = useGithubAuthStore();

// Refs
const vcsMenu = ref(null);
const showGithubAuthModal = ref(false);
const showGithubOrgModal = ref(false);

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

// Event emits
const emit = defineEmits(['update:project']);
</script>

<style scoped>
.project-view {
	min-height: 100vh;
}

.workspace-card {
	background: white;
	transition: all 0.2s ease-in-out;
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