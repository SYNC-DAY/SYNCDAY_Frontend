// GithubAuthModal.vue
<template>
	<div class="flex flex-col gap-4 p-6">
		<h2 class="text-xl font-bold">GitHub Integration</h2>
		<button @click="handleGithubAuth"
			class="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
			<img src="@/assets/images/github-icon.svg" alt="GitHub" class="w-6 h-6" />
			Authorize with GitHub
		</button>
	</div>
</template>

<script setup>
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { storeToRefs } from 'pinia';

const githubAuthStore = useGithubAuthStore();
const githubOrgStore = useGithubOrgStore();

const { isAuthenticated } = storeToRefs(githubAuthStore);

const handleGithubAuth = () => {
	githubAuthStore.loginWithGithub();
};

// Watch for authentication state changes
watch(isAuthenticated, async (newValue) => {
	if (newValue) {
		// Once authenticated, fetch organizations
		await githubOrgStore.fetchOrganizations();
	}
});
</script>