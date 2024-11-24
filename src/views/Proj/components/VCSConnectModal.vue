<template>
	<div v-if="isOpen" class="modal-overlay">
	  <div class="modal-container">
		<div class="modal-header">
		  <h3>Connect Version Control System</h3>
		  <button class="close-button" @click="handleClose">×</button>
		</div>
  
		<!-- Error Display -->
		<div v-if="authStore.hasError" class="error-message">
		  {{ authStore.error }}
		  <button class="dismiss-button" @click="authStore.clearError">Dismiss</button>
		</div>
  
		<!-- Loading State -->
		<div v-if="authStore.isLoading || repoStore.isLoading" class="modal-content-center">
		  <div class="loading-spinner"></div>
		  <p>Loading...</p>
		</div>
  
		<!-- Main Content -->
		<div v-else class="modal-content">
		  <!-- Login State -->
		  <div v-if="!authStore.isAuthenticated">
			<p class="description">Connect your GitHub account to get started</p>
			<button 
			  class="github-button"
			  @click="authStore.loginWithGithub"
			  :disabled="authStore.isLoading"
			>
			  <svg height="20" viewBox="0 0 16 16" width="20" class="github-icon">
				<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="currentColor"></path>
			  </svg>
			  Login with GitHub
			</button>
		  </div>
  
		  <!-- Repository Selection -->
		  <div v-else>
			<!-- User Info -->
			<div class="user-info">
			  <img :src="authStore.avatarUrl" :alt="authStore.username" class="avatar">
			  <div>
				<p>Connected as {{ authStore.username }}</p>
				<button class="text-button" @click="handleLogout">Switch Account</button>
			  </div>
			</div>
  
			<!-- Repository Search -->
			<div class="search-container">
			  <input
				type="text"
				v-model="searchQuery"
				placeholder="Search repositories..."
				class="search-input"
			  />
			</div>
  
			<!-- Repository List -->
			<div class="repo-list">
			  <div
				v-for="repo in filteredRepositories"
				:key="repo.id"
				class="repo-item"
				:class="{ active: selectedRepo?.id === repo.id }"
				@click="selectRepository(repo)"
			  >
				<div class="repo-name">{{ repo.name }}</div>
				<div class="repo-description">{{ repo.description || 'No description' }}</div>
				<div class="repo-meta">
				  <span>{{ repo.private ? 'Private' : 'Public' }}</span>
				  <span>•</span>
				  <span>Updated {{ formatDate(repo.updated_at) }}</span>
				</div>
			  </div>
			</div>
  
			<!-- Action Buttons -->
			<div class="modal-actions">
			  <button class="secondary-button" @click="handleClose">Cancel</button>
			  <button 
				class="primary-button" 
				@click="confirmSelection"
				:disabled="!selectedRepo || isConnecting"
			  >
				{{ isConnecting ? 'Connecting...' : 'Connect Repository' }}
			  </button>
			</div>
		  </div>
		</div>
	  </div>
	</div>
</template>
  
<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore'
  import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore'
  import axios from 'axios'
  
const props = defineProps({
	isOpen: Boolean,
	projectId: {
	  type: [String, Number],
	  required: true
	}
  })
  
const emit = defineEmits(['close', 'update:project'])
  
  // Stores
  const authStore = useGithubAuthStore()
  const repoStore = useGithubRepoStore()
  
  // State
  const searchQuery = ref('')
  const selectedRepo = ref(null)
  const isConnecting = ref(false)
  
  // Computed
const filteredRepositories = computed(() => {
	if (!searchQuery.value) return repoStore.allRepositories
	const query = searchQuery.value.toLowerCase()
	return repoStore.allRepositories.filter(repo => 
	  repo.name.toLowerCase().includes(query) || 
	  (repo.description && repo.description.toLowerCase().includes(query))
	)
  })
  
  // Methods
const initializeApp = async () => {
	const urlParams = new URLSearchParams(window.location.search)
	const code = urlParams.get('code')
	const token = localStorage.getItem('github_token')
  
	try {
	  if (code) {
		console.log(`code: ${code}`)
		await authStore.handleAuthCallback(code)
		await authStore.fetchUserInfo()
		await repoStore.fetchUserRepos()
	  } else if (token && !repoStore.allRepositories.length) {
		authStore.setAccessToken(token)
		await authStore.fetchUserInfo()
		await repoStore.fetchUserRepos()
	  }
	} catch (error) {
	  console.error('Setup error:', error)
	  authStore.error = error.message
	}
  }
  
const handleLogout = () => {
	authStore.logout()
	repoStore.clearRepositories()
	selectedRepo.value = null
  }
  
const selectRepository = (repo) => {
	selectedRepo.value = repo
  }
  
const handleClose = () => {
	selectedRepo.value = null
	searchQuery.value = ''
	emit('close')
  }
  
const formatDate = (dateString) => {
	const date = new Date(dateString)
	const now = new Date()
	const diffTime = Math.abs(now - date)
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
	if (diffDays === 1) return 'yesterday'
	if (diffDays < 30) return `${diffDays} days ago`
	if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
	return `${Math.floor(diffDays / 365)} years ago`
  }
  
const confirmSelection = async () => {
	if (!selectedRepo.value) return
  
	try {
	  isConnecting.value = true
	  const response = await axios.patch(`/api/proj/${props.projectId}`, {
		vcs_type: 'GITHUB',
		vcs_proj_url: selectedRepo.value.html_url
	  })
  
	  if (response.data.success) {
		emit('update:project', response.data.data)
		handleClose()
	  }
	} catch (error) {
	  authStore.error = 'Failed to connect repository. Please try again.'
	} finally {
	  isConnecting.value = false
	}
  }
  
//   onMounted(initializeApp)
</script>
  
<style scoped>
  .modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
  }
  
  .modal-container {
	background: white;
	border-radius: 8px;
	width: 90%;
	max-width: 600px;
	max-height: 80vh;
	overflow-y: auto;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
	padding: 1rem;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
  }
  
  .modal-content {
	padding: 1.5rem;
  }
  
  .modal-content-center {
	padding: 2rem;
	text-align: center;
  }
  
  .user-info {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1.5rem;
  }
  
  .avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
  }
  
  .github-button {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	width: 100%;
	padding: 0.75rem;
	background: #24292e;
	color: white;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: background-color 0.2s;
  }
  
  .github-button:hover {
	background: #2c3137;
  }
  
  .search-input {
	width: 100%;
	padding: 0.75rem;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	margin-bottom: 1rem;
  }
  
  .repo-list {
	max-height: 300px;
	overflow-y: auto;
	margin-bottom: 1rem;
  }
  
  .repo-item {
	padding: 1rem;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	margin-bottom: 0.5rem;
	cursor: pointer;
	transition: all 0.2s;
  }
  
  .repo-item:hover {
	background: #f9fafb;
  }
  
  .repo-item.active {
	border-color: #3b82f6;
	background: #eff6ff;
  }
  
  .repo-name {
	font-weight: 600;
	margin-bottom: 0.25rem;
  }
  
  .repo-description {
	color: #6b7280;
	font-size: 0.875rem;
	margin-bottom: 0.5rem;
  }
  
  .repo-meta {
	font-size: 0.75rem;
	color: #9ca3af;
  }
  
  .modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
	margin-top: 1.5rem;
  }
  
  .primary-button, .secondary-button {
	padding: 0.5rem 1rem;
	border-radius: 6px;
	font-weight: 500;
	cursor: pointer;
  }
  
  .primary-button {
	background: #3b82f6;
	color: white;
	border: none;
  }
  
  .primary-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
  }
  
  .secondary-button {
	background: white;
	border: 1px solid #e5e7eb;
	color: #374151;
  }
  
  .text-button {
	background: none;
	border: none;
	color: #3b82f6;
	cursor: pointer;
  }
  
  .error-message {
	background: #fee2e2;
	color: #991b1b;
	padding: 0.75rem;
	margin: 1rem;
	border-radius: 6px;
	display: flex;
	justify-content: space-between;
	align-items: center;
  }
  
  .loading-spinner {
	border: 3px solid #f3f3f3;
	border-top: 3px solid #3b82f6;
	border-radius: 50%;
	width: 24px;
	height: 24px;
	animation: spin 1s linear infinite;
	margin: 0 auto 1rem;
  }
  
  @keyframes spin {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
  }
</style>