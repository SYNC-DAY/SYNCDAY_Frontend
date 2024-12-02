<template>
	<div class="github-container">
		<!-- GitHub App 설치 버튼 -->
		<button v-if="!githubAppStore.installationId" @click="installGithubApp" class="install-button">
			Install GitHub App
		</button>

		<!-- Organization 데이터 표시 -->
		<div v-else class="org-container">
			<h2>GitHub Organizations</h2>
			<div v-if="githubAppStore.isLoading">Loading...</div>
			<div v-else-if="githubAppStore.error" class="error">
				{{ githubAppStore.error }}
			</div>
			<div v-else>
				<!-- Organization 목록이 여기에 표시됩니다 -->
			</div>
		</div>
	</div>
</template>

<script setup>
import { useGithubAppAuthStore } from '@/stores/useGithubAppAuthstore';
import { onMounted } from 'vue'
useGithubAppAuthStore

const githubAppStore = useGithubAppAuthStore()

const installGithubApp = () => {
	githubAppStore.initiateInstallation()
}

onMounted(async () => {
	if (githubAppStore.installationId) {
		try {
			await githubAppStore.fetchOrganizationData()
		} catch (error) {
			console.error('Failed to fetch organizations:', error)
		}
	}
})
</script>

<style scoped>
.github-container {
	padding: 20px;
}

.install-button {
	padding: 10px 20px;
	font-size: 16px;
	cursor: pointer;
}

.org-container {
	margin-top: 20px;
}

.error {
	color: red;
	margin-top: 10px;
}
</style>