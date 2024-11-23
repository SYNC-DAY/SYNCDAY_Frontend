<!-- ProjectView.vue -->
<template>
	<div class="proj-header">
	  <div class="proj-title-item">
		<h3>{{ project.proj_name }}</h3>
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
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  const props = defineProps({
	projectId: {
	  type: [String, Number],
	  required: true
	},
	projects: {
	  type: Array,
	  required: true
	}
  })
  
  const router = useRouter()
  
  const project = computed(() => 
	props.projects.find(p => p.proj_id === parseInt(props.projectId))
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
  </script>
  
  <style scoped>
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
  </style>