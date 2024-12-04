<template>
	<div class="github-callback">
		<ProgressSpinner v-if="loading" />
		<div v-else-if="error" class="error">{{ error }}</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';

const loading = ref(true);
const error = ref(null);
const githubAuthStore = useGithubAuthStore();

onMounted(async () => {
	try {
		// Get code from URL
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');

		if (!code) {
			throw new Error('Authorization code not found');
		}

		// Exchange code for token
		await githubAuthStore.handleAuthCallback(code);

		// Get redirect path or default to '/'
		const redirectPath = localStorage.getItem('github_auth_redirect') || '/';
		localStorage.removeItem('github_auth_redirect');

		// Notify opener window
		if (window.opener) {
			window.opener.postMessage({ type: 'github-auth-success' }, window.location.origin);
			window.close();
		} else {
			// Fallback if opened directly
			window.location.href = redirectPath;
		}
	} catch (err) {
		error.value = err.message;
		// Notify opener of error
		if (window.opener) {
			window.opener.postMessage({
				type: 'github-auth-error',
				error: err.message
			}, window.location.origin);
			setTimeout(() => window.close(), 1000);
		}
	} finally {
		loading.value = false;
	}
});
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