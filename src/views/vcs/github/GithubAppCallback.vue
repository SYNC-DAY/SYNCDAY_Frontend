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


const handleOAuthCallback = async (code, state) => {
	// Validate state exists
	if (!state) {
		throw new Error('State parameter is missing');
	}

	// Get stored state


	try {
		// Decode and parse state data

		// Handle OAuth
		await githubAuthStore.handleAuthCallback(code);

		// Clear stored state
		sessionStorage.removeItem('github_auth_state');

		// Notify opener with original context
		notifyOpener('auth-success', {
			redirect: stateData.redirect,
			projectId: stateData.projectId
		});

	} catch (error) {
		console.error('OAuth callback error:', error);
		throw new Error('Failed to process OAuth callback');
	}
};

onMounted(async () => {
	try {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
		const installationId = urlParams.get('installation_id')
		const setupAction = urlParams.get('setup_action')
		console.log(code)
		console.log(state)
		if (code && state) {
			await handleOAuthCallback(code, state);
		} else if (installationId && setupAction) {
			await handleInstallationCallback(installationId, setupAction);
		} else {
			throw new Error('Invalid callback parameters');
		}
	} catch (err) {
		error.value = err.message;
		notifyOpener('error', err.message);
	} finally {
		loading.value = false;
		// Close window after short delay
		// setTimeout(() => window.close(), 1000);
	}
});

const handleInstallationCallback = async (installationId, setupAction) => {


	await githubAppStore.handleInstallationCallback(installationId, setupAction);
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
		// window.close();
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