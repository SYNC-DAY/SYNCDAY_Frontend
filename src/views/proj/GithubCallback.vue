<template>
	<div class="callback-page">
	  GitHub 연동 중...
	</div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
  
  const router = useRouter();
  const githubStore = useGithubAuthStore();
  
  onMounted(async () => {
	console.log('GithubCallback mounted');
	// Get code from URL and state if needed
	const params = new URLSearchParams(window.location.search);
	const code = params.get('code');
	const state = params.get('state');
	
	console.log('Received code:', code);
	
	try {
	  if (code) {
		await githubStore.handleAuthCallback(code);
		
		// Check if we have a return path in state
		const returnPath = state ? JSON.parse(decodeURIComponent(state)).returnPath : '/project';
		router.push(returnPath);
	  } else {
		console.error('No code received from GitHub');
		router.push('/project');
	  }
	} catch (error) {
	  console.error('GitHub callback error:', error);
	  router.push('/project');
	}
  });
  </script>