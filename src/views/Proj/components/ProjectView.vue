<template>
	<div class="project-container">
	  <div class="header">
		<h2>{{ project.proj_name }}</h2>
		
		<!-- Simple VCS section -->
		<div class="vcs-section">
		  <a 
			v-if="project.vcs_type" 
			:href="project.vcs_proj_url" 
			target="_blank"
		  >
			GitHub Repository
		  </a>
		  <button 
			v-else 
			@click="handleOpenVCSModal"
		  >
			Connect GitHub
		  </button>
		</div>
	  </div>
  
	  <div class="content">
		<h3>Workspaces</h3>
		<!-- Your workspace content here -->
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
  </script>
  
  <style scoped>
  .project-container {
	padding: 20px;
  }
  
  .header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
  }
  
  .content {
	margin-top: 20px;
  }
  </style>