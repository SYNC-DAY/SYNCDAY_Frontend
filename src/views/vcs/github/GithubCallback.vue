<template>
	<div class="flex flex-column align-items-center justify-content-center min-h-screen">
		<ProgressSpinner v-if="isLoading" />
		<div v-if="error" class="text-center">
			<h2>Authentication Failed</h2>
			<p class="text-red-500">{{ error }}</p>
			<Button label="Try Again" @click="handleRetry" />
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useGithubAuthStore();
const isLoading = ref(true);
const error = ref(null);

const handleAuth = async () => {
	try {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');

		if (!code) {
			throw new Error('No authorization code provided');
		}

		// Handle the OAuth callback and get the token
		await authStore.handleAuthCallback(code);

		// Fetch user information
		await authStore.fetchUserInfo();

		// Get the saved redirect path
		const redirectPath = localStorage.getItem('github_auth_redirect') || '/';
		localStorage.removeItem('github_auth_redirect'); // Clean up

		// Redirect back to the original page
		router.replace(redirectPath);
	} catch (err) {
		error.value = err.message;
	} finally {
		isLoading.value = false;
	}
};

const handleRetry = () => {
	authStore.loginWithGithub();
};

onMounted(() => {
	handleAuth();
});
</script>