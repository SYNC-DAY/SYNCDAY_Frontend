<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" :modal="true" header="VCS Integration"
		:style="{ width: '70vw', height: '50vh' }" class="p-0">
		<!-- VCS Selection -->
		<div class="flex justify-content-end mb-4">

			<Button label="VCS Type" icon="pi pi-cog" @click="toggleVcsMenu" severity="secondary" />
			<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
		</div>

		<!-- GitHub Installation Section -->
		<div v-if="selectedVcs === 'GITHUB' && !githubAuthStore.isInstalled" class="mt-4">
			<h3 class="text-lg font-medium mb-4">GitHub Integration</h3>

			<div class="flex flex-column align-items-center py-6">
				<h4 class="text-xl font-medium mb-2">GitHub App Installation Required</h4>
				<p class="text-gray-600 mb-4">
					To connect your GitHub organizations, you need to install our GitHub App first.
				</p>
				<Button label="Install GitHub App" severity="primary" @click="openInstallationWindow" />
			</div>
		</div>
	</Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';


import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';
// Props
const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	},
	projectId: {
		type: Number,
		required: true
	},
	projectData: {
		type: Object,
		required: true
	}
});

// Emits
const emit = defineEmits(['update:visible']);

// Stores and Services
const authStore = useAuthStore();
const githubAuthStore = useGithubAuthStore();
const { user } = storeToRefs(authStore);
const toast = useToast();

// Refs
const vcsMenu = ref(null);
const selectedVcs = ref('GITHUB');
const installationWindow = ref(null);
const checkWindowInterval = ref(null);



// Methods
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);
};

const handleVcsSelection = async (vcsType) => {
	selectedVcs.value = vcsType;
	if (vcsType === 'GITHUB') {
		await githubAuthStore.checkInstallationStatus(user.value.userId);
	}
};

const toggleVcsMenu = (event) => {
	vcsMenu.value.toggle(event);
};

const openInstallationWindow = () => {
	// Save project ID for installation callback
	localStorage.setItem('github_installation_project_id', props.projectId);

	const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
	const callbackUrl = `${window.location.origin}/github/callback`;
	const fullUrl = `${installUrl}?callback_url=${encodeURIComponent(callbackUrl)}`;

	const width = 1020;
	const height = 618;
	const left = (window.innerWidth - width) / 2;
	const top = (window.innerHeight - height) / 2;

	installationWindow.value = window.open(
		fullUrl,
		'Install GitHub App',
		`width=${width},height=${height},top=${top},left=${left}`
	);

	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}

	checkWindowInterval.value = setInterval(() => {
		if (installationWindow.value?.closed) {
			clearInterval(checkWindowInterval.value);
			checkWindowInterval.value = null;
			installationWindow.value = null;
			localStorage.removeItem('github_installation_project_id');
		}
	}, 500);
};

const handleInstallationMessage = (event) => {
	if (event.origin !== window.location.origin) return;

	if (event.data.type === 'github-auth-success') {
		toast.add({
			severity: 'success',
			summary: '성공',
			detail: 'GitHub 연동이 완료되었습니다',
			life: 3000
		});
		loadOrganizations();
	}
};

const loadOrganizations = async () => {
	// Implement your organization loading logic here
	await githubAuthStore.checkInstallationStatus(user.value.userId);
	// Additional organization loading if needed
};

// Lifecycle hooks
onMounted(() => {
	window.addEventListener('message', handleInstallationMessage);
});

onUnmounted(() => {
	window.removeEventListener('message', handleInstallationMessage);
	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}
});
</script>

<style scoped>
.p-dialog-content {
	padding: 1.5rem;
}
</style>