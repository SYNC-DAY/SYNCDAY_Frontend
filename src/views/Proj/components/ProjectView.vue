<template>
	<div class="proj-header">
	  <div class="proj-title-item">
		<h3>{{ project?.proj_name }}</h3>
		<div class="member-role">
		  <p>역할</p>
		</div>
	  </div>
  
	  <div class="proj-title-item">
		<div>
		  <div>workspace |</div>
		  <div>| members</div>
		</div>
		<div>VCS</div>
	  </div>
	</div>
  
	<div class="proj-content">
	  <div class="proj-content-top">
		<span style="font-size: 1.5rem;">Workspaces</span>
	  </div>
	  <div class="proj-content-main">
		<div class="workspace-container">
		  <div 
			v-for="workspace in project?.workspaces" 
			:key="workspace.workspace_id" 
			class="workspace-item"
			@click="navigateToWorkspace(workspace.workspace_id)"
		  >
			<div class="workspace-info">
			  <h4>{{ workspace.workspace_name }}</h4>
			  <p class="workspace-progress">{{ workspace.progress_status }}%</p>
			</div>
			<div class="workspace-bar-container">
			  <div 
				class="workspace-bar" 
				:style="{ width: `${workspace.progress_status}%` }"
			  ></div>
			</div>
		  </div>
  
		  <!-- New Workspace Creation Section -->
		  <div v-if="showNewWorkspaceInput" class="workspace-item new-workspace-input-container">
			<input
			  v-model="newWorkspaceName"
			  @keyup.enter="createWorkspace"
			  @keyup.esc="cancelNewWorkspace"
			  placeholder="Enter workspace name..."
			  ref="newWorkspaceInput"
			  class="new-workspace-input"
			/>
		  </div>
  
		  <!-- Add Workspace Button -->
		  <button 
			v-if="!showNewWorkspaceInput"
			@click="showNewWorkspaceInput = true"
			class="add-workspace-btn"
		  >
			+ New Workspace
		  </button>
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { computed, ref, watch, nextTick, inject } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'
  
  const props = defineProps({
	projectId: {
	  type: [String, Number],
	  required: true
	}
  })
  
  const router = useRouter()
  
  // Inject shared refs
  const projects = inject('projects')
  const workspaces = inject('workspaces')
  
  // New refs for workspace creation
  const showNewWorkspaceInput = ref(false)
  const newWorkspaceName = ref('')
  const newWorkspaceInput = ref(null)
  
  const project = computed(() => 
	projects.value.find(p => p.proj_id === parseInt(props.projectId))
  )
  
  const formatDate = (dateString) => {
	if (!dateString) return ''
	return new Date(dateString).toLocaleDateString('ko-KR', {
	  year: 'numeric',
	  month: 'long',
	  day: 'numeric'
	})
  }
  
  const navigateToWorkspace = (workspaceId) => {
	router.push({
	  name: 'Workspace',
	  params: {
		projectId: props.projectId,
		workspaceId
	  }
	})
  }
  
  // New methods for workspace creation
  const createWorkspace = async () => {
	if (!newWorkspaceName.value.trim()) return
  
	try {
	  const response = await axios.post('/workspaces', {
		workspace_name: newWorkspaceName.value.trim(),
		proj_id: props.projectId
	  })
  
	  if (response.data.success) {
		// Create new workspace object with default values
		const newWorkspace = {
		  workspace_id: response.data.data.workspace_id,
		  workspace_name: response.data.data.workspace_name,
		  project_id: parseInt(props.projectId),
		  progress_status: 0,
		  bookmark_status: 'UNBOOKMARKED',
		  ...response.data.data
		}
  
		// Update workspaces ref
		workspaces.value = [...workspaces.value, newWorkspace]
  
		// Update projects ref
		const projectIndex = projects.value.findIndex(p => p.proj_id === parseInt(props.projectId))
		if (projectIndex !== -1) {
		  const updatedProject = {
			...projects.value[projectIndex],
			workspaces: [...projects.value[projectIndex].workspaces, newWorkspace]
		  }
		  projects.value = [
			...projects.value.slice(0, projectIndex),
			updatedProject,
			...projects.value.slice(projectIndex + 1)
		  ]
		}
  
		// Reset input state
		newWorkspaceName.value = ''
		showNewWorkspaceInput.value = false
  
		// Navigate to new workspace
		await navigateToWorkspace(newWorkspace.workspace_id)
	  }
	} catch (err) {
	  console.error('Failed to create workspace:', err)
	  // You might want to add error handling UI here
	}
  }
  
  const cancelNewWorkspace = () => {
	showNewWorkspaceInput.value = false
	newWorkspaceName.value = ''
  }
  
  // Watch for input visibility changes to focus input
  watch(showNewWorkspaceInput, async (newVal) => {
	if (newVal) {
	  await nextTick()
	  newWorkspaceInput.value?.focus()
	}
  })
  </script>
  
  <style scoped>
  /* 스타일은 변경 없음 */
  </style>
<style scoped>
  /* Existing styles remain the same */
  .proj-header {
	border-bottom: 1px solid var(--outline-gray);
	display: flex;
	flex-direction: row;
	justify-content: space-around;
  }
  
  .proj-title-item {
	flex: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-around;
  }
  
  .proj-title-item div {
	display: flex;
	flex-direction: row;
  }
  
  .proj-content {
	display: flex;
	flex-direction: column;
	padding: 2rem;
  }
  
  .proj-content-main {
	display: flex;
	flex-direction: column;
	margin-top: 2rem;
  }
  
  .workspace-container {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
  }
  
  .workspace-item {
	cursor: pointer;
	padding: 1rem;
	border-radius: 0.5rem;
	background-color: white;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	transition: all 0.2s ease;
  }
  
  .workspace-item:hover {
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .workspace-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 0.5rem;
  }
  
  .workspace-info h4 {
	margin: 0;
	font-size: 1.1rem;
  }
  
  .workspace-progress {
	margin: 0;
	color: #666;
  }
  
  .workspace-bar-container {
	width: 100%;
	height: 8px;
	background-color: #f3f4f6;
	border-radius: 4px;
	overflow: hidden;
  }
  
  .workspace-bar {
	height: 100%;
	border-radius: 4px;
	background: linear-gradient(90deg, #FF6B6B 0%, #FFA07A 100%);
	transition: width 0.3s ease;
  }
  
  /* New styles for workspace creation */
  .add-workspace-btn {
	width: 100%;
	padding: 1rem;
	text-align: center;
	color: #6b7280;
	background-color: #f9fafb;
	border: 2px dashed #e5e7eb;
	border-radius: 0.5rem;
	transition: all 0.2s ease;
	cursor: pointer;
  }
  
  .add-workspace-btn:hover {
	color: #374151;
	background-color: #f3f4f6;
	border-color: #d1d5db;
  }
  
  .new-workspace-input-container {
	cursor: default;
  }
  
  .new-workspace-input {
	width: 100%;
	padding: 0.5rem;
	border: 1px solid #e5e7eb;
	border-radius: 0.375rem;
	font-size: 0.875rem;
	outline: none;
	transition: border-color 0.2s;
  }
  
  .new-workspace-input:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
  </style>