<template>
	<div id="app">
	  <h1>GitHub OAuth Example</h1>
	  
	  <div v-if="authStore.hasError" class="error-message">
		{{ authStore.error }}
		<button @click="authStore.clearError">Dismiss</button>
	  </div>
  
	  <div v-if="authStore.isLoading || repoStore.isLoading" class="loading">
		Loading...
	  </div>
	  
	  <button v-if="!authStore.isAuthenticated" 
			  @click="authStore.loginWithGithub"
			  :disabled="authStore.isLoading">
		Login with GitHub
	  </button>
  
	  <div v-if="authStore.isAuthenticated" class="user-info">
		<img :src="authStore.avatarUrl" alt="Profile" class="avatar" v-if="authStore.avatarUrl">
		<h2>Welcome, {{ authStore.username }}!</h2>
		<button @click="handleLogout">Logout</button>
  
		<div class="repositories">
		  <h3>Your Repositories</h3>
		  <ul v-if="repoStore.allRepositories.length">
			<li v-for="repo in repoStore.allRepositories" 
				:key="repo.id" 
				@click="selectRepo(repo)">
			  {{ repo.name }}
			</li>
		  </ul>
		  <p v-else>No repositories found.</p>
		</div>
  
		<div v-if="branches.length" class="branches">
		  <h3>Branches for {{ selectedRepo }}</h3>
		  <ul>
			<li v-for="branch in branches" 
				:key="branch.name"
				@click="selectBranch(branch)">
			  {{ branch.name }}
			</li>
		  </ul>
		</div>
  
		<div v-if="commits.length" class="commits">
		  <h3>Commits for {{ selectedBranch }} in {{ selectedRepo }}</h3>
		  <ul>
			<li v-for="commit in commits" :key="commit.sha">
			  {{ commit.commit.message }}
			</li>
		  </ul>
		</div>
	  </div>
	</div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useGithubAuthStore } from './stores/useGithubAuthStore';
  import { useGithubRepoStore } from './stores/useGithubRepoStore';
  import axios from 'axios';
  
  export default {
	name: 'App',
	setup() {
	  const authStore = useGithubAuthStore();
	  const repoStore = useGithubRepoStore();
	  const branches = ref([]);
	  const commits = ref([]);
	  const selectedRepo = ref('');
	  const selectedBranch = ref('');
  
	  onMounted(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		
		if (code) {
		  try {
			await authStore.handleAuthCallback(code);
			await repoStore.fetchUserRepos();
		  } catch (error) {
			console.error('Authentication error:', error);
		  }
		} else if (authStore.isAuthenticated) {
		  await repoStore.fetchUserRepos();
		}
	  });
  
	  const handleLogout = () => {
		authStore.logout();
		repoStore.clearRepositories();
		branches.value = [];
		commits.value = [];
		selectedRepo.value = '';
		selectedBranch.value = '';
	  };
  
	  const fetchBranches = async (repoName) => {
		try {
		  const response = await axios.get(
			`https://api.github.com/repos/${authStore.username}/${repoName}/branches`,
			{
			  headers: { 
				Authorization: `Bearer ${authStore.accessToken}`,
				Accept: 'application/vnd.github.v3+json'
			  }
			}
		  );
		  branches.value = response.data;
		} catch (error) {
		  console.error('Error fetching branches:', error);
		}
	  };
  
	  const fetchCommits = async (repoName, branchName) => {
		try {
		  const response = await axios.get(
			`https://api.github.com/repos/${authStore.username}/${repoName}/commits`,
			{
			  params: { sha: branchName },
			  headers: { 
				Authorization: `Bearer ${authStore.accessToken}`,
				Accept: 'application/vnd.github.v3+json'
			  }
			}
		  );
		  commits.value = response.data;
		} catch (error) {
		  console.error('Error fetching commits:', error);
		}
	  };
  
	  const selectRepo = (repo) => {
		selectedRepo.value = repo.name;
		fetchBranches(repo.name);
	  };
  
	  const selectBranch = (branch) => {
		selectedBranch.value = branch.name;
		fetchCommits(selectedRepo.value, branch.name);
	  };
  
	  return {
		authStore,
		repoStore,
		branches,
		commits,
		selectedRepo,
		selectedBranch,
		handleLogout,
		selectRepo,
		selectBranch,
	  };
	}
  };
  </script>
  
  <style>
  /* Styles remain the same */
  </style>