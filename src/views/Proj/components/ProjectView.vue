<!-- ProjectView.vue -->
<template>
	<div class="proj-header">
	  <div class="proj-title-item">
		<h3>{{ project.proj_name }}</h3>
		<div class="member-role">
		  <p>{{ userRole }}</p>
		</div>
	  </div>
  
	  <div class="proj-title-item">
		<div>
		  <div class="view-mode">workspaces |</div>
		  <div>| members</div>
		</div>
		<!-- VCS Integration -->
		<div class="vcs-section">
		  <template v-if="project.vcs_type">
			<a 
			  :href="project.vcs_proj_url" 
			  target="_blank" 
			  class="vcs-link"
			>
			  <svg v-if="project.vcs_type === 'GITHUB'" height="20" viewBox="0 0 16 16" width="20" class="mr-2">
				<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="currentColor"></path>
			  </svg>
			  View Repository
			</a>
		  </template>
		  <button 
			v-else 
			@click="openVCSModal"
			class="connect-vcs-btn"
		  >
			Connect VCS
		  </button>
		</div>
	  </div>
	</div>
  
	<div class="proj-content">
	  <!-- Rest of the project view content -->
	  <div class="proj-content-top">
		<span style="font-size: 1.5rem;">Workspaces</span>
	  </div>
	  <div class="proj-content-main">
		<!-- Workspace items -->
	  </div>
	</div>
  
	<!-- VCS Connect Modal -->
	<VCSConnectModal 
	  :is-open="isVCSModalOpen"
	  :project-id="projectId"
	  @close="closeVCSModal"
	  @update:project="handleProjectUpdate"
	/>
</template>
<script setup>
  import { ref,computed } from 'vue'
  import { useRouter } from 'vue-router'
  import VCSConnectModal from './VCSConnectModal.vue'

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
  const isVCSModalOpen = ref(false)

  const project = computed(() => 
	props.projects.find(p => p.proj_id === parseInt(props.projectId))
  )
  const userRole = computed(() => {
  // Implement role computation based on user's membership status
  return 'Member' // Placeholder
})
const openVCSModal = () => {
  isVCSModalOpen.value = true
}
const closeVCSModal = () => {
  isVCSModalOpen.value = false
}
const handleProjectUpdate = (updatedProject) => {
  // Emit event to parent to update project data
  emit('update:project', updatedProject)
}
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

  .vcs-section {
  display: flex;
  align-items: center;
}

.vcs-link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #374151;
  text-decoration: none;
  transition: all 0.2s;
}

.vcs-link:hover {
  background-color: #f3f4f6;
}

.connect-vcs-btn {
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.connect-vcs-btn:hover {
  background-color: #e5e7eb;
}


  </style>