<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" :modal="true" header="Github Integration"
		:style="{ width: '70vw', padding: '1rem' }" class="p-0">
		<!-- VCS Selection -->
		<div class="flex justify-content-end mb-4">
			<div class="container-row justify-right">
			</div>
		</div>

		<!-- GitHub Installation Section -->
		<div v-if="selectedVcs === 'GITHUB' && !githubAuthStore.isInstalled" class="mt-4">

			<div v-for="installation in githubAppStore.installations" :key="installation.installationId"
				@click.stop="selectOrganization(installation)">
				<Avatar :image="installation.avatarUrl" :alt="installation.accountName" shape="circle" class="mr-3" />
				<div class="flex-1">
					<div class="font-medium">{{ installation.accountName }}</div>
				</div>

			</div>


			<Button label="Install GitHub App" severity="primary" @click="openInstallationWindow" />
		</div>
	</Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
import { storeToRefs } from 'pinia';
import { useToast } from 'primevue/usetoast';


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
const githubAppStore = useGithubAppStore();
const { user } = storeToRefs(authStore);
const toast = useToast();

// Refs
const selectedVcs = ref('GITHUB');
const installationWindow = ref(null);
const checkWindowInterval = ref(null);
const installations = ref(null);


// Methods
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);
};





const openInstallationWindow = () => {
	// Save project ID for installation callback
	localStorage.setItem('github_installation_project_id', props.projectId);

	const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
	const callbackUrl = `${window.location.origin}/github/callback`;

	// Add target_type=user parameter to the URL
	const params = new URLSearchParams({
		callback_url: callbackUrl,
		target_type: 'user'
	});

	const fullUrl = `${installUrl}?${params.toString()}`;

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
	}
};


// Lifecycle hooks
onMounted(() => {
	githubAppStore.fetchInstallations();
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