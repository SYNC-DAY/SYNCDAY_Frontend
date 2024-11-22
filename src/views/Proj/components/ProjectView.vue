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
	.proj-header{
		border-bottom: 1px solid var(--outline-gray);
		display:flex;
		flex-direction: row;
		justify-content: space-around;
	}

	.proj-title-item{
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

	.proj-content{
		display: flex;
		flex-direction: column;
	}

	.proj-content-top{
		
	}
</style>