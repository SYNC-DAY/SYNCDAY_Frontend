<!-- ProjectView.vue -->
<template>
	<div class="proj-header">
		<h2>{{ project.proj_name }}</h2>
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
	}

	.proj-role{
		
	}
</style>