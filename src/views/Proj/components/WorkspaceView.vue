<!-- WorkspaceView.vue -->
<template>
	<div v-if="workspace" class="max-w-4xl">
	  <div class="mb-6">
		<h1 class="text-2xl font-semibold mb-2">{{ workspace.workspace_name }}</h1>
		<div class="text-sm text-gray-600">생성일: {{ formatDate(workspace.created_at) }}</div>
	  </div>
  
	  <div class="workspace-header bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
		<div class="flex justify-between items-center mb-4">
		  <h2 class="font-medium">워크스페이스 진행 현황</h2>
		  <div class="text-sm">
			{{ formatDate(workspace.start_time) }} - {{ formatDate(workspace.end_time) }}
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
  
	  <div class="workspace-tabs mb-6">
		<button 
		  v-for="tab in tabs" 
		  :key="tab.id"
		  class="tab-button"
		  :class="{ active: activeTab === tab.id }"
		  @click="activeTab = tab.id"
		>
		  {{ tab.name }}
		</button>
	  </div>
  
	  <div v-if="activeTab === 'board'" class="workspace-boards grid grid-cols-3 gap-6">
		<div 
		  v-for="board in ['Board 1', 'Board 2', 'Board 3']" 
		  :key="board"
		  class="board bg-pink-50 p-4 rounded-lg"
		>
		  <h3 class="font-medium mb-4">{{ board }}</h3>
		  <div class="space-y-2">
			<div 
			  v-for="i in 3" 
			  :key="i"
			  class="card bg-white p-3 rounded shadow-sm border border-gray-200"
			>
			  Card {{ i }}
			</div>
		  </div>
		</div>
	  </div>
  
	  <div v-else-if="activeTab === 'kanban'" class="kanban-view">
		<!-- Kanban 뷰 구현 -->
		칸반 뷰 개발 중
	  </div>
  
	  <div v-else-if="activeTab === 'calendar'" class="calendar-view">
		<!-- Calendar 뷰 구현 -->
		캘린더 뷰 개발 중
	  </div>
	</div>
	<div v-else class="h-full flex items-center justify-center text-gray-500">
	  워크스페이스를 찾을 수 없습니다
	</div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
	projectId: {
	  type: [String, Number],
	  required: true
	},
	workspaceId: {
	  type: [String, Number],
	  required: true
	},
	projects: {
	  type: Array,
	  required: true
	}
  })
  
  const activeTab = ref('board')
  
  const tabs = [
	{ id: 'board', name: '보드' },
	{ id: 'kanban', name: '칸반' },
	{ id: 'calendar', name: '캘린더' }
  ]
  
  const workspace = computed(() => {
  const project = props.projects.find(p => p.proj_id === parseInt(props.projectId))
  if (!project) return null
  return project.workspaces.find(w => w.workspace_id === parseInt(props.workspaceId))
})
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.workspace-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  position: relative;
}

.tab-button.active {
  color: #ff7eb3;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #ff7eb3;
}

.board {
  min-height: 400px;
}

.card {
  cursor: pointer;
  transition: all 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border-color: #ff7eb3;
}

.workspace-boards {
  height: calc(100vh - 300px);
  overflow-x: auto;
}
</style>