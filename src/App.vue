<template>
	<div id="app">
	  <h1>GitHub OAuth Example</h1>
	  
	  <!-- Error Display -->
	  <div v-if="authStore.hasError" class="error-message">
		{{ authStore.error }}
		<button @click="authStore.clearError">Dismiss</button>
	  </div>
  
	  <!-- Loading State -->
	  <div v-if="authStore.isLoading || repoStore.isLoading" class="loading">
		Loading...
	  </div>
	  
	  <!-- Login Button -->
	  <button 
		v-if="!authStore.isAuthenticated" 
		@click="authStore.loginWithGithub"
		:disabled="authStore.isLoading"
	  >
		Login with GitHub
	  </button>
  
	  <!-- User Info and Data -->
	  <div v-if="authStore.isAuthenticated" class="user-info">
		<!-- User Profile -->
		<img 
		  v-if="authStore.avatarUrl" 
		  :src="authStore.avatarUrl" 
		  alt="Profile" 
		  class="avatar"
		>
		<h2>Welcome, {{ authStore.username }}!</h2>
		<button @click="handleLogout">Logout</button>
  
		<!-- Repositories List -->
		<div class="repositories">
		  <h3>Your Repositories</h3>
		  <ul v-if="repoStore.allRepositories.length">
			<li 
			  v-for="repo in repoStore.allRepositories" 
			  :key="repo.id" 
			  @click="handleRepoSelect(repo)"
			  :class="{ active: selectedRepo === repo.name }"
			>
			  {{ repo.name }}
			</li>
		  </ul>
		  <p v-else>No repositories found.</p>
		</div>
  
		<!-- Branches List -->
		<div v-if="branches.length" class="branches">
		  <h3>Branches for {{ selectedRepo }}</h3>
		  <ul>
			<li 
			  v-for="branch in branches" 
			  :key="branch.name"
			  @click="handleBranchSelect(branch)"
			  :class="{ active: selectedBranch === branch.name }"
			>
			  {{ branch.name }}
			</li>
		  </ul>
		</div>
  
		<!-- Commits List -->
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
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useGithubAuthStore } from './stores/useGithubAuthStore'
  import { useGithubRepoStore } from './stores/useGithubRepoStore'
  import axios from 'axios'
  
  // Store initialization
  const authStore = useGithubAuthStore()
  const repoStore = useGithubRepoStore()
  
  // State declarations
  const branches = ref([])
  const commits = ref([])
  const selectedRepo = ref('')
  const selectedBranch = ref('')
  
  // Methods
  const initializeApp = async () => {
	const urlParams = new URLSearchParams(window.location.search)
	const code = urlParams.get('code')
	const token = localStorage.getItem('github_token')
	
	try {
	  if (code) {
		// Handle OAuth callback
		await authStore.handleAuthCallback(code)
		await authStore.fetchUserInfo()
		await repoStore.fetchUserRepos()
	  } else if (token) {
		// Handle existing session
		authStore.setAccessToken(token)
		await authStore.fetchUserInfo()
		
		// Check for cached repositories
		const cachedRepos = localStorage.getItem('github_repositories')
		if (cachedRepos) {
		  repoStore.repositories = JSON.parse(cachedRepos)
		} else {
		  await repoStore.fetchUserRepos()
		}
	  }
	} catch (error) {
	  console.error('Setup error:', error)
	  authStore.error = error.message
	}
  }
  
  const handleLogout = () => {
	authStore.logout()
	repoStore.clearRepositories()
	clearLocalState()
  }
  
  const clearLocalState = () => {
	branches.value = []
	commits.value = []
	selectedRepo.value = ''
	selectedBranch.value = ''
  }
  
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
	  )
	  branches.value = response.data
	} catch (error) {
	  console.error('Error fetching branches:', error)
	  authStore.error = error.message
	}
  }
  
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
	  )
	  commits.value = response.data
	} catch (error) {
	  console.error('Error fetching commits:', error)
	  authStore.error = error.message
	}
  }
  
  const handleRepoSelect = (repo) => {
	selectedRepo.value = repo.name
	selectedBranch.value = ''
	commits.value = []
	fetchBranches(repo.name)
  }
  
  const handleBranchSelect = (branch) => {
	selectedBranch.value = branch.name
	fetchCommits(selectedRepo.value, branch.name)
  }
  
  // Lifecycle hooks
  onMounted(initializeApp)
  </script>
  
  <style scoped>
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
	max-width: 600px;
	margin: 0 auto;
  }
  
  li {
	cursor: pointer;
	padding: 10px;
	margin: 5px 0;
	background-color: #f5f5f5;
	border-radius: 4px;
	transition: background-color 0.2s;
  }
  
  li:hover {
	background-color: #e0e0e0;
  }
  
  li.active {
	background-color: #4CAF50;
	color: white;
  }
  </style>