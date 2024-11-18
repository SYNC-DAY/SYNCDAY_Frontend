<template>
	<div id="app">
	  <h1>GitHub OAuth Example</h1>
  
	  <!-- Error Display -->
	  <div v-if="authStore.hasError" class="error-message">
		{{ authStore.error }}
		<button @click="authStore.clearError">Dismiss</button>
	  </div>
  
	  <!-- Loading State -->
	  <div v-if="authStore.isLoading || repoStore.isLoading || branchStore.isLoading || commitStore.isLoading"
		class="loading">
		Loading...
	  </div>
  
	  <!-- Login Button -->
	  <button v-if="!authStore.isAuthenticated" @click="authStore.loginWithGithub" :disabled="authStore.isLoading">
		Login with GitHub
	  </button>
  
	  <!-- User Info and Data -->
	  <div v-if="authStore.isAuthenticated" class="user-info">
		<!-- User Profile -->
		<img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="Profile" class="avatar">
		<h2>Welcome, {{ authStore.username }}!</h2>
		<button @click="handleLogout">Logout</button>
  
		<!-- Repositories List -->
		<div class="repositories">
		  <h3>Your Repositories</h3>
		  <ul v-if="repoStore.allRepositories.length">
			<li v-for="repo in repoStore.allRepositories" :key="repo.id" @click="handleRepoSelect(repo)"
			  :class="{ active: branchStore.currentRepo?.name === repo.name }">
			  {{ repo.name }}
			</li>
		  </ul>
		  <p v-else>No repositories found.</p>
		</div>
  
		<!-- Branches List -->
		<div v-if="branchStore.allBranches.length" class="branches">
		  <h3>Branches for {{ branchStore.currentRepo?.name }}</h3>
		  <ul>
			<li v-for="branch in branchStore.allBranches" :key="branch.name" @click="handleBranchSelect(branch)"
			  :class="{ active: branchStore.currentBranch === branch.name }">
			  {{ branch.name }}
			</li>
		  </ul>
		</div>
  
		<!-- Commits List -->
		<div v-if="commitStore.allCommits.length" class="commits">
        <h3>Commits for {{ branchStore.currentBranch }} in {{ branchStore.currentRepo?.name }}</h3>
        <ul>
          <li 
            v-for="commit in commitStore.allCommits" 
            :key="commit.sha"
            @click="handleCommitClick(commit)"
            class="commit-item"
          >
            <img 
              :src="commit.author?.avatar_url || commit.committer?.avatar_url || '/default-avatar.png'" 
              :alt="commit.commit.author.name"
              class="commit-author-avatar"
            >
            <div class="commit-content">
              <div class="commit-message">{{ commit.commit.message }}</div>
              <div class="commit-details">
                <span class="commit-author">{{ commit.commit.author.name }}</span>
                <span class="commit-date">{{ formatDate(commit.commit.author.date) }}</span>
                <span class="commit-sha">{{ commit.sha.slice(0, 7) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { onMounted } from 'vue'
  import { useGithubAuthStore } from '@/stores/useGithubAuthStore';
  import { useGithubRepoStore } from '@/stores/useGithubRepoStore'
  import { useGithubBranchStore } from '@/stores/useGithubBranchStore'
  import { useGithubCommitStore } from '@/stores/useGithubCommitStore'
  
  // Store initialization
  const authStore = useGithubAuthStore()
  const repoStore = useGithubRepoStore()
  const branchStore = useGithubBranchStore()
  const commitStore = useGithubCommitStore()
  
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
	branchStore.clearState()
	commitStore.clearState()
  }
  
  const handleRepoSelect = (repo) => {
	branchStore.setSelectedRepo(repo)
	commitStore.clearState()
  }
  
  const handleBranchSelect = async (branch) => {
	branchStore.setSelectedBranch(branch.name)
	await commitStore.fetchCommits(branchStore.currentRepo, branch.name)
  }
  
  const handleCommitClick = (commit) => {
	if (commit.html_url) {
	  window.open(commit.html_url, '_blank')
	}
  }
  
  const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
	  year: 'numeric',
	  month: 'short',
	  day: 'numeric',
	})
  }
  
  // Lifecycle hooks
  onMounted(initializeApp)
  </script>
  
  <style scoped>
  /* Previous styles remain the same */
  
  .commit-item {
	text-align: left;
	cursor: pointer;
	padding: 15px;
	margin: 8px 0;
	background-color: #f5f5f5;
	border-radius: 4px;
	transition: background-color 0.2s;
  }

  .commit-author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}
.commit-content {
  flex: 1;
  min-width: 0; /* Prevents flex item from overflowing */
}
  .commit-item:hover {
	background-color: #e0e0e0;
  }
  
  .commit-message {
	font-weight: 500;
	margin-bottom: 8px;
	line-height: 1.4;
  }
  
  .commit-details {
	font-size: 0.9em;
	color: #666;
	display: flex;
	gap: 15px;
  }
  
  .commit-author {
	font-weight: 500;
  }
  
  .commit-date {
	color: #888;
  }
  
  .commit-sha {
	font-family: monospace;
	color: #444;
  }
  
  /* Keep all previous styles */
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
  
  .repositories,
  .branches,
  .commits {
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