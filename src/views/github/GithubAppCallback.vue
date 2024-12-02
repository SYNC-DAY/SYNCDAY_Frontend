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
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useGithubAppAuthStore } from '@/stores/useGithubAppAuthstore';

const router = useRouter();
const githubAppStore = useGithubAppAuthStore();
const error = ref('');
const isLoading = ref(true);

onMounted(async () => {
	console.log("callback mounted")
	try {
		// URL에서 파라미터 추출
		const urlParams = new URLSearchParams(window.location.search);
		const installationId = urlParams.get('installation_id');
		const setupAction = urlParams.get('setup_action');

		console.log('Installation callback received:', {
			installationId,
			setupAction,

		});

		if (!installationId) {
			throw new Error('No installation ID provided');
		}

		// 백엔드로 설치 정보 전송
		const response = await fetch('/api/github/installation/complete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				installation_id: installationId,
				setup_action: setupAction,
			})
		});

		if (!response.ok) {
			throw new Error('Failed to complete installation');
		}

		// 설치 성공 후 원래 페이지로 리다이렉트
		const redirectPath = localStorage.getItem('github_app_redirect') || '/';
		localStorage.removeItem('github_app_redirect');

		await router.push(redirectPath);

	} catch (err) {
		console.error('Setup callback error:', err);
		error.value = err.message || 'Failed to complete installation';
	} finally {
		isLoading.value = false;
	}
});
</script>