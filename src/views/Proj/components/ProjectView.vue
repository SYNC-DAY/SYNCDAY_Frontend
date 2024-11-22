<!-- ProjectView.vue -->
<template>
	<div v-if="project" class="max-w-4xl">
	  <div class="mb-6">
		<h1 class="text-2xl font-semibold mb-2">{{ project.proj_name }}</h1>
		<div class="text-sm text-gray-600">생성일: {{ formatDate(project.created_at) }}</div>
	  </div>
  
	  <div class="grid gap-4 mb-8">
		<div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
		  <div class="flex justify-between items-center mb-4">
			<h2 class="font-medium">프로젝트 진행 현황</h2>
			<div class="text-sm">
			  {{ formatDate(project.start_time) }} - {{ formatDate(project.end_time) }}
			</div>
		  </div>
		  <div class="flex items-center gap-2 mb-2">
			<span class="text-sm text-gray-600">진행률:</span>
			<span>{{ project.progress_status }}%</span>
		  </div>
		  <div class="w-full h-2 bg-gray-200 rounded-full">
			<div 
			  class="h-full rounded-full bg-gradient-to-r from-[#ff7eb3] to-[#ff9f7d]"
			  :style="{ width: `${project.progress_status}%` }"
			></div>
		  </div>
		</div>
	  </div>
  
	  <div class="workspace-section">
		<h2 class="text-lg font-medium mb-4">워크스페이스</h2>
		<div class="grid gap-4">
		  <template v-for="workspace in project.workspaces" :key="workspace.workspace_id">
			<div 
			  class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-pink-300"
			  @click="navigateToWorkspace(workspace.workspace_id)"
			>
			  <div class="flex justify-between items-center mb-4">
				<h3 class="font-medium">{{ workspace.workspace_name }}</h3>
				<div class="text-sm text-gray-600">
				  생성일: {{ formatDate(workspace.created_at) }}
				</div>
			  </div>
			  <div class="flex items-center gap-2 mb-2">
				<span class="text-sm text-gray-600">진행률:</span>
				<span>{{ workspace.progress_status }}%</span>
			  </div>
			  <div class="w-full h-2 bg-gray-200 rounded-full">
				<div 
				  class="h-full rounded-full bg-gradient-to-r from-[#ff7eb3] to-[#ff9f7d]"
				  :style="{ width: `${workspace.progress_status}%` }"
				></div>
			  </div>
			</div>
		  </template>
		</div>
	  </div>
	</div>
	<div v-else class="h-full flex items-center justify-center text-gray-500">
	  프로젝트를 찾을 수 없습니다
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