<template>
	<div v-if="!project" class="project-not-found">
	  <h2>Project Not Found</h2>
	  <p>The requested project could not be found.</p>
	  <button @click="goBack" class="back-button">Go Back</button>
	</div>
  
	<div v-else class="project-container">
	  <div class="header">
		<h2>{{ project.proj_name }}</h2>
		
		<!-- Simple VCS section -->
		<div class="vcs-section">
		  <a 
			v-if="project.vcs_type" 
			:href="project.vcs_proj_url" 
			target="_blank"
			class="vcs-link"
		  >
			GitHub Repository
		  </a>
		  <button 
			v-else 
			@click="handleOpenVCSModal"
			class="connect-github-btn"
		  >
			Connect VCS Organizations
		  </button>
		</div>
	  </div>
  
	  <div class="content">
		<h3>Workspaces</h3>
		<div v-if="project.workspaces?.length" class="workspaces-grid">
		  <div 
			v-for="workspace in project.workspaces" 
			:key="workspace.workspace_id"
			class="workspace-card"
			@click="navigateToWorkspace(workspace.workspace_id)"
		  >
			<h4>{{ workspace.workspace_name }}</h4>
			<div class="progress-bar">
			  <div 
				class="progress-fill"
				:style="{ width: `${workspace.progress_status}%` }"
			  ></div>
			</div>
			<span class="progress-text">{{ workspace.progress_status }}% Complete</span>
		  </div>
		</div>
		<div v-else class="no-workspaces">
		  <p>No workspaces found. Create a new workspace to get started.</p>
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { computed, getCurrentInstance } from 'vue';
  import { useRouter } from 'vue-router';
  
  const props = defineProps({
	projectId: {
	  type: [String, Number],
	  required: true
	},
	projects: {
	  type: Array,
	  required: true
	}
  });
  
  const { proxy } = getCurrentInstance();
  const router = useRouter();
  
  const project = computed(() => 
	props.projects.find(p => p.proj_id === parseInt(props.projectId))
  );
  
  const handleOpenVCSModal = () => {
	proxy.$root.openVCSModal(props.projectId);
  };
  
  const navigateToWorkspace = (workspaceId) => {
	router.push({
	  name: 'Workspace',
	  params: {
		projectId: props.projectId,
		workspaceId
	  }
	});
  };
  
  const goBack = () => {
	router.back();
  };
  </script>
  
  <style scoped>
  .project-container {
	padding: 20px;
  }
  
  .project-not-found {
	text-align: center;
	padding: 40px;
  }
  
  .back-button {
	margin-top: 20px;
	padding: 8px 16px;
	background-color: #3b82f6;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
  }
  
  .back-button:hover {
	background-color: #2563eb;
  }
  
  .header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
  }
  
  .vcs-section {
	display: flex;
	align-items: center;
  }
  
  .vcs-link,
  .connect-github-btn {
	padding: 8px 16px;
	border-radius: 4px;
	text-decoration: none;
  }
  
  .vcs-link {
	background-color: #24292e;
	color: white;
  }
  
  .connect-github-btn {
	background-color: #2ea44f;
	color: white;
	border: none;
	cursor: pointer;
  }
  
  .connect-github-btn:hover {
	background-color: #2c974b;
  }
  
  .content {
	margin-top: 20px;
  }
  
  .workspaces-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 20px;
	margin-top: 20px;
  }
  
  .workspace-card {
	padding: 16px;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
  }
  
  .workspace-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  .progress-bar {
	width: 100%;
	height: 4px;
	background-color: #e5e7eb;
	border-radius: 2px;
	margin: 8px 0;
	overflow: hidden;
  }
  
  .progress-fill {
	height: 100%;
	background: linear-gradient(to right, #ff7eb3, #ff9f7d);
	transition: width 0.3s ease;
  }
  
  .progress-text {
	font-size: 0.875rem;
	color: #6b7280;
  }
  
  .no-workspaces {
	text-align: center;
	padding: 40px;
	color: #6b7280;
	background-color: #f9fafb;
	border-radius: 8px;
	margin-top: 20px;
  }
  </style>