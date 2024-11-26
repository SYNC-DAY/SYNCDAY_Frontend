<template>
	<div v-if="isOpen" class="modal-overlay">
	  <div class="modal-container">
		<div class="modal-header">
		  <h3>Connect GitHub Organization</h3>
		  <button class="close-button" @click="handleClose">×</button>
		</div>
  
		<!-- Error Display -->
		<div v-if="error" class="error-message">
		  {{ error }}
		  <button class="dismiss-button" @click="error = null">Dismiss</button>
		</div>
  
		<!-- Loading State -->
		<div v-if="isLoading" class="modal-content-center">
		  <div class="loading-spinner"></div>
		  <p>Loading organizations...</p>
		</div>
  
		<!-- Main Content -->
		<div v-else class="modal-content">
		  <!-- Login State -->
		  <div v-if="!authStore.isAuthenticated">
			<p class="description">Connect your GitHub account to access organizations</p>
			<button 
			  class="github-button"
			  @click="authStore.loginWithGithub"
			  :disabled="isLoading"
			>
			  <svg height="20" viewBox="0 0 16 16" width="20" class="github-icon">
				<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="currentColor"></path>
			  </svg>
			  Login with GitHub
			</button>
		  </div>
  
		  <!-- Organization Selection -->
		  <div v-else>
			<div class="user-info">
			  <img :src="authStore.avatarUrl" :alt="authStore.username" class="avatar">
			  <div class="user-details">
				<p class="user-name">{{ authStore.username }}</p>
				<button class="text-button" @click="handleLogout">Switch Account</button>
			  </div>
			</div>
  
			<div class="org-list">
			  <div
				v-for="org in orgStore.allOrganizations"
				:key="org.id"
				class="org-item"
				:class="{ active: selectedOrg?.id === org.id }"
				@click="selectOrganization(org)"
			  >
				<img :src="org.avatar_url" :alt="org.login" class="org-avatar">
				<div class="org-details">
				  <div class="org-name">{{ org.login }}</div>
				  <div class="org-description">{{ org.description || 'No description available' }}</div>
				</div>
			  </div>
			</div>
  
			<!-- Action Buttons -->
			<div class="modal-actions">
			  <button class="secondary-button" @click="handleClose">Cancel</button>
			  <button 
				class="primary-button" 
				@click="confirmSelection"
				:disabled="!selectedOrg || isConnecting"
			  >
				{{ isConnecting ? 'Connecting...' : 'Connect Organization' }}
			  </button>
			</div>
		  </div>
		</div>
	  </div>
	</div>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
  import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
  
  const props = defineProps({
	isOpen: Boolean,
	projectId: {
	  type: [String, Number],
	  required: true
	}
  });
  
  const emit = defineEmits(['close', 'update:project']);
  
  const authStore = useGithubAuthStore();
  const orgStore = useGithubOrgStore();
  
  const selectedOrg = ref(null);
  const error = ref(null);
  const isConnecting = ref(false);
  const isLoading = ref(false);
  
  const handleLogout = () => {
	authStore.logout();
	orgStore.clearState();
	selectedOrg.value = null;
  };
  
  const selectOrganization = (org) => {
	selectedOrg.value = org;
  };
  
  const handleClose = () => {
	selectedOrg.value = null;
	error.value = null;
	isConnecting.value = false;
	emit('close');
  };
  
  const confirmSelection = async () => {
	if (!selectedOrg.value) return;
  
	try {
	  isConnecting.value = true;
	  const response = await fetch(`/api/proj/${props.projectId}`, {
		method: 'PATCH',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify({
		  vcs_type: 'GITHUB',
		  vcs_proj_url: `https://github.com/${selectedOrg.value.login}`
		})
	  });
  
	  if (!response.ok) {
		throw new Error('Failed to update project');
	  }
  
	  const data = await response.json();
	  if (data.success) {
		emit('update:project', data.data);
		handleClose();
	  }
	} catch (err) {
	  error.value = 'Failed to connect organization. Please try again.';
	} finally {
	  isConnecting.value = false;
	}
  };
  
  onMounted(async () => {
	if (authStore.isAuthenticated) {
	  try {
		isLoading.value = true;
		await orgStore.fetchOrganizations();
	  } catch (err) {
		error.value = 'Failed to fetch organizations';
	  } finally {
		isLoading.value = false;
	  }
	}
  });
</script>
  <style scoped>
  .recent-badge {
	font-size: 0.75rem;
	background: #3b82f6;
	color: white;
	padding: 0.125rem 0.375rem;
	border-radius: 9999px;
	margin-left: 0.5rem;
	vertical-align: middle;
  }
  
  .org-item.recently-used {
	border-left: 3px solid #3b82f6;
  }
  
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
  
  .org-list {
	margin-bottom: 1.5rem;
	max-height: 400px;
	overflow-y: auto;
  }
  
  .org-item {
	display: flex;
	align-items: center;
	padding: 0.75rem;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	margin-bottom: 0.5rem;
	cursor: pointer;
	transition: all 0.2s;
  }
  
  .org-item:hover {
	background: #f9fafb;
  }
  
  .org-item.active {
	border-color: #3b82f6;
	background: #eff6ff;
  }
  
  .org-avatar {
	width: 32px;
	height: 32px;
	border-radius: 4px;
	margin-right: 1rem;
  }
  
  .org-details {
	flex: 1;
  }
  
  .org-name {
	font-weight: 600;
	margin-bottom: 0.25rem;
  }
  
  .org-description {
	font-size: 0.875rem;
	color: #6b7280;
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