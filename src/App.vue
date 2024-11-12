<template>
	<div id="app">
	  <h1>GitHub OAuth Example</h1>
	  
	  <div v-if="authStore.hasError" class="error-message">
		{{ authStore.error }}
		<button @click="authStore.clearError">Dismiss</button>
	  </div>
  
	  <div v-if="authStore.isLoading" class="loading">
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
		<button @click="authStore.logout">Logout</button>
  
		<div class="repositories">
		  <h3>Your Repositories</h3>
		  <ul v-if="repositories.length">
			<li v-for="repo in repositories" 
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
  import { useAuthStore } from './stores/useAuthStore';
  import axios from 'axios';
  
  export default {
	name: 'App',
	setup() {
	  const authStore = useAuthStore();
	  const repositories = ref([]);
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
			await fetchRepos();
		  } catch (error) {
			console.error('Authentication error:', error);
		  }
		} else if (authStore.isAuthenticated) {
		  await fetchRepos();
		}
	  });
  
	  const fetchRepos = async () => {
		try {
		  repositories.value = await authStore.fetchUserRepos();
		} catch (error) {
		  console.error('Error fetching repositories:', error);
		}
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
		repositories,
		branches,
		commits,
		selectedRepo,
		selectedBranch,
		selectRepo,
		selectBranch,
	  };
	}
  };
  </script>
  
  <style>
  #app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	margin-top: 60px;
	padding: 0 20px;
  }
  
  .error-message {
	background-color: #ff5252;
	color: white;
	padding: 10px;
	margin: 10px 0;
	border-radius: 4px;
  }
  
  .loading {
	color: #666;
	margin: 20px 0;
  }
  
  .avatar {
	width: 100px;
	height: 100px;
	border-radius: 50%;
	margin: 10px 0;
  }
  
  button {
	padding: 10px 20px;
	margin: 10px;
	font-size: 16px;
	cursor: pointer;
  }
  
  button:disabled {
	opacity: 0.7;
	cursor: not-allowed;
  }
  
  .repositories, .branches, .commits {
	margin: 20px 0;
  }
  
  ul {
	list-style: none;
	padding: 0;
  }
  
  li {
	cursor: pointer;
	padding: 5px;
	margin: 5px 0;
	background-color: #f5f5f5;
	border-radius: 4px;
  }
  
  li:hover {
	background-color: #e0e0e0;
  }
  </style>