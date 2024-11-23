<template>
	<div v-if="isOpen" class="modal-overlay">
	  <div class="modal-container">
		<div class="modal-header">
		  <h3>Connect Version Control System</h3>
		  <button class="close-button" @click="handleClose">×</button>
		</div>
  
		<!-- Loading State -->
		<div v-if="isLoading" class="modal-content-center">
		  <div class="loading-spinner"></div>
		  <p>{{ loadingMessage }}</p>
		</div>
  
		<!-- Error Display -->
		<div v-else-if="error" class="error-container">
		  <p>{{ error }}</p>
		  <button class="primary-button" @click="resetError">Try Again</button>
		</div>
  
		<!-- VCS Selection -->
		<div v-else-if="!selectedVCS" class="modal-content">
		  <p class="description">Select a version control system to connect with your project</p>
		  
		  <button class="vcs-button" @click="selectVCS('GITHUB')">
			<span>GitHub</span>
		  </button>
  
		  <button class="vcs-button disabled" disabled>
			<span>GitLab (Coming Soon)</span>
		  </button>
		</div>
  
		<!-- Repository Selection -->
		<div v-else-if="!selectedRepo && repositories.length > 0" class="modal-content">
		  <div class="action-bar">
			<button class="text-button" @click="resetSelection">← Back</button>
			<button class="text-button" @click="refreshRepositories">Refresh List</button>
		  </div>
  
		  <!-- Search Input -->
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
			  @click="selectRepository(repo)"
			>
			  <div class="repo-name">{{ repo.name }}</div>
			  <div class="repo-description">{{ repo.description || 'No description' }}</div>
			  <div class="repo-meta">
				<span>Stars: {{ repo.stargazers_count }}</span>
				<span>•</span>
				<span>Updated {{ formatDate(repo.updated_at) }}</span>
			  </div>
			</div>
		  </div>
		</div>
  
		<!-- Confirmation -->
		<div v-else-if="selectedRepo" class="modal-content">
		  <div class="action-bar">
			<button class="text-button" @click="selectedRepo = null">← Back</button>
		  </div>
  
		  <div class="selected-repo">
			<h4>Selected Repository</h4>
			<p>{{ selectedRepo.full_name }}</p>
			<div class="repo-details">
			  <p>Branch: {{ selectedRepo.default_branch }}</p>
			  <p>Visibility: {{ selectedRepo.private ? 'Private' : 'Public' }}</p>
			</div>
		  </div>
  
		  <div class="modal-actions">
			<button class="secondary-button" @click="handleClose">Cancel</button>
			<button 
			  class="primary-button" 
			  @click="confirmSelection"
			  :disabled="isConnecting"
			>
			  {{ isConnecting ? 'Connecting...' : 'Connect Repository' }}
			</button>
		  </div>
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
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
  const selectedVCS = ref(null)
  const selectedRepo = ref(null)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const error = ref(null)
  const isConnecting = ref(false)
  
  // Computed
  const repositories = computed(() => repoStore.allRepositories)
  const filteredRepositories = computed(() => {
	if (!searchQuery.value) return repositories.value
	const query = searchQuery.value.toLowerCase()
	return repositories.value.filter(repo => 
	  repo.name.toLowerCase().includes(query) || 
	  (repo.description && repo.description.toLowerCase().includes(query))
	)
  })
  
  // Methods
  const selectVCS = async (type) => {
	selectedVCS.value = type
	if (type === 'GITHUB' && !authStore.isAuthenticated) {
	  authStore.loginWithGithub(props.projectId)
	  return
	}
	
	try {
	  isLoading.value = true
	  loadingMessage.value = 'Fetching repositories...'
	  await repoStore.fetchUserRepos()
	} catch (err) {
	  error.value = 'Failed to fetch repositories. Please try again.'
	} finally {
	  isLoading.value = false
	}
  }
  
  const selectRepository = (repo) => {
	selectedRepo.value = repo
  }
  
  const resetSelection = () => {
	selectedVCS.value = null
	selectedRepo.value = null
	searchQuery.value = ''
	error.value = null
  }
  
  const resetError = () => {
	error.value = null
	selectedVCS.value = null
  }
  
  const refreshRepositories = async () => {
	try {
	  isLoading.value = true
	  loadingMessage.value = 'Refreshing repositories...'
	  await repoStore.fetchUserRepos()
	} catch (err) {
	  error.value = 'Failed to refresh repositories. Please try again.'
	} finally {
	  isLoading.value = false
	}
  }
  
  const handleClose = () => {
	resetSelection()
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
		vcs_type: selectedVCS.value,
		vcs_proj_url: selectedRepo.value.html_url
	  })
	  
	  if (response.data.success) {
		emit('update:project', response.data.data)
		handleClose()
	  }
	} catch (err) {
	  error.value = 'Failed to connect repository. Please try again.'
	} finally {
	  isConnecting.value = false
	}
  }
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
	max-width: 500px;
	max-height: 80vh;
	overflow-y: auto;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .modal-header {
	padding: 1rem;
	border-bottom: 1px solid #eee;
	display: flex;
	justify-content: space-between;
	align-items: center;
  }
  
  .modal-header h3 {
	margin: 0;
	font-size: 1.25rem;
  }
  
  .close-button {
	background: none;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
	padding: 0 0.5rem;
  }
  
  .modal-content {
	padding: 1rem;
  }
  
  .modal-content-center {
	padding: 2rem;
	text-align: center;
  }
  
  .description {
	color: #666;
	margin-bottom: 1rem;
  }
  
  .vcs-button {
	width: 100%;
	padding: 0.75rem;
	margin: 0.5rem 0;
	border: 1px solid #ddd;
	border-radius: 4px;
	background: white;
	cursor: pointer;
	text-align: left;
	transition: background-color 0.2s;
  }
  
  .vcs-button:hover:not(.disabled) {
	background: #f8f8f8;
  }
  
  .vcs-button.disabled {
	opacity: 0.5;
	cursor: not-allowed;
  }
  
  .search-container {
	margin: 1rem 0;
  }
  
  .search-input {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 4px;
  }
  
  .repo-list {
	max-height: 300px;
	overflow-y: auto;
  }
  
  .repo-item {
	padding: 0.75rem;
	border: 1px solid #eee;
	border-radius: 4px;
	margin: 0.5rem 0;
	cursor: pointer;
  }
  
  .repo-item:hover {
	background: #f8f8f8;
  }
  
  .repo-name {
	font-weight: bold;
  }
  
  .repo-description {
	color: #666;
	font-size: 0.9rem;
	margin: 0.25rem 0;
  }
  
  .repo-meta {
	font-size: 0.8rem;
	color: #888;
  }
  
  .repo-meta span {
	margin: 0 0.25rem;
  }
  
  .selected-repo {
	background: #f8f8f8;
	padding: 1rem;
	border-radius: 4px;
	margin: 1rem 0;
  }
  
  .repo-details {
	color: #666;
	font-size: 0.9rem;
	margin-top: 0.5rem;
  }
  
  .action-bar {
	display: flex;
	justify-content: space-between;
	margin-bottom: 1rem;
  }
  
  .modal-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
	margin-top: 1rem;
  }
  
  .primary-button {
	background: #0066cc;
	color: white;
	border: none;
	padding: 0.5rem 1rem;
	border-radius: 4px;
	cursor: pointer;
  }
  
  .primary-button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
  }
  
  .secondary-button {
	background: white;
	border: 1px solid #ddd;
	padding: 0.5rem 1rem;
	border-radius: 4px;
	cursor: pointer;
  }
  
  .text-button {
	background: none;
	border: none;
	color: #0066cc;
	cursor: pointer;
	padding: 0.25rem;
  }
  
  .error-container {
	padding: 1rem;
	text-align: center;
	color: #dc3545;
  }
  
  .loading-spinner {
	border: 3px solid #f3f3f3;
	border-top: 3px solid #0066cc;
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