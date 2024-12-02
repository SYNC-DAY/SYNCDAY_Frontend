<template>
	<div class="github-container">
		<div v-if="!installationId">
			<button @click="installGithubApp">GitHub App 설치</button>
		</div>
		<div v-else>
			<p>Installation ID: {{ installationId }}</p>
			<div v-if="organizations">
				<h3>Organizations:</h3>
				<pre>{{ organizations }}</pre>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const installationId = ref(null)
const organizations = ref(null)

// GitHub App 설치 시작
const installGithubApp = () => {
	const githubAppName = import.meta.env.VITE_GITHUB_APP_NAME
	window.location.href = `https://github.com/apps/${githubAppName}/installations/new`
}

// 설치 후 처리
const handleInstallation = async (id) => {
	try {
		// 백엔드로 installation ID 전송
		const response = await axios.post('/api/github/installation', {
			installationId: id
		})

		if (response.data) {
			// 토큰을 사용하여 organization 정보 조회
			const orgsResponse = await axios.get('/api/github/organizations', {
				headers: {
					Authorization: `Bearer ${response.data}`
				}
			})
			organizations.value = orgsResponse.data
		}
	} catch (error) {
		console.error('GitHub App installation error:', error)
	}
}

onMounted(() => {
	// URL에서 installation_id 파라미터 확인
	const id = route.query.installation_id
	if (id) {
		installationId.value = id
		handleInstallation(id)
	}
})
</script>

<style scoped>
.github-container {
	padding: 20px;
}
</style>