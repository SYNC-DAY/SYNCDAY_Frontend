<template>
	<div class="github-callback">
		<ProgressSpinner v-if="loading" />
		<div v-else-if="error" class="error">{{ error }}</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';

const loading = ref(true);
const error = ref(null);
const githubAuthStore = useGithubAuthStore();
const githubAppStore = useGithubAppStore();

onMounted(async () => {
	try {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const installationId = urlParams.get('installation_id');
		const setupAction = urlParams.get('setup_action');

		// Handle OAuth login
		if (code && !installationId) {
			await handleOAuthCallback(code);
		}
		// Handle App installation
		else if (installationId && setupAction) {
			await handleInstallationCallback(installationId);
		}
		else {
			throw new Error('Invalid callback parameters');
		}
	} catch (err) {
		error.value = err.message;
		notifyOpener('error', err.message);
		setTimeout(() => window.close(), 1000);
	} finally {
		loading.value = false;
	}
});

const handleOAuthCallback = async (code) => {
	await githubAuthStore.handleAuthCallback(code);

	const redirectPath = localStorage.getItem('github_auth_redirect') || '/';
	localStorage.removeItem('github_auth_redirect');

	notifyOpener('auth-success');

	if (!window.opener) {
		window.location.href = redirectPath;
	}
};

const handleInstallationCallback = async (installationId) => {
	const projectId = localStorage.getItem('github_installation_project_id');
	if (!projectId) {
		throw new Error('Project ID not found');
	}

	await githubAppStore.handleInstallationCallback(projectId, installationId);
	localStorage.removeItem('github_installation_project_id');

	notifyOpener('installation-success', { installationId });
};

const notifyOpener = (type, data = null) => {
	if (window.opener) {
		const message = {
			type: `github-${type}`,
			data: data
		};
		window.opener.postMessage(message, window.location.origin);
		window.close();
	}
};
</script>

<style scoped>
.github-callback {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
}

.error {
	color: red;
	text-align: center;
}
</style>