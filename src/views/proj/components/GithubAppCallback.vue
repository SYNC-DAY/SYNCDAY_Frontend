<template>
	<div class="flex items-center justify-center min-h-screen p-4">
		<div v-if="isLoading" class="text-center">
			<div class="mb-4">Installing GitHub App...</div>
			<!-- 로딩 스피너 추가 가능 -->
		</div>
		<div v-else-if="error" class="text-red-500">
			{{ error }}
		</div>
	</div>
</template>

<script setup>
// views/vcs/github/GithubAppInstall.vue
import { defineComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';

const route = useRoute();
const router = useRouter();
const githubAuthStore = useGithubAuthStore();
const githubAppStore = useGithubAppStore();
const githubAuthRedirectPath = localStorage.getItem('github_auth_redirect')
onMounted(async () => {
	const code = route.query.code;
	const installationId = route.query.installation_id;
	try {
		if (!code || !installationId) {
			await githubAuthStore.handleAuthCallback(code);
			return;
		} else if (installationId) {
			await githubAppStore.handleAppInstallation(installationId, code);
			router.push(githubAuthRedirectPath)
		}
	} catch (error) {
		console.log(error);
	}

});


</script>