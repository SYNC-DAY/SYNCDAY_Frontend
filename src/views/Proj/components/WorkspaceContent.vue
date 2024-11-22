<template>
	<div class="workspace-page">
	  <div class="workspace-header">
		<h1>{{ workspace?.workspace_name }}</h1>
		<div class="workspace-tabs">
		  <button 
			class="tab-button"
			:class="{ active: activeTab === 'board' }"
			@click="activeTab = 'board'"
		  >
			Board
		  </button>
		  <button 
			class="tab-button"
			:class="{ active: activeTab === 'kanban' }"
			@click="activeTab = 'kanban'"
		  >
			Kanban
		  </button>
		  <button 
			class="tab-button"
			:class="{ active: activeTab === 'calendar' }"
			@click="activeTab = 'calendar'"
		  >
			Calendar
		  </button>
		</div>
	  </div>
	  
	  <div class="workspace-content">
		<!-- 각 탭에 해당하는 컴포넌트를 여기에 추가 -->
		<component :is="currentView" />
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  
  const route = useRoute()
  const workspace = ref(null)
  const activeTab = ref('board')
  
  const currentView = computed(() => {
	// 실제 구현시 각 탭에 해당하는 컴포넌트를 여기서 반환
	return null
  })
  
  const fetchWorkspaceData = async () => {
	try {
	  const response = await axios.get(`/workspaces/${route.params.workspaceId}`)
	  if (response.data.success) {
		workspace.value = response.data.data
	  }
	} catch (error) {
	  console.error('Failed to fetch workspace:', error)
	}
  }
  
  onMounted(() => {
	fetchWorkspaceData()
  })
  </script>
  
  <style scoped>
  .workspace-page {
	padding: 2rem;
  }
  
  .workspace-header {
	margin-bottom: 2rem;
  }
  
  .workspace-tabs {
	display: flex;
	gap: 1rem;
	margin-top: 1rem;
	border-bottom: 1px solid #e5e7eb;
  }
  
  .tab-button {
	padding: 0.5rem 1rem;
	border: none;
	background: none;
	cursor: pointer;
	font-size: 1rem;
	color: #6b7280;
  }
  
  .tab-button.active {
	color: #ff7eb3;
	border-bottom: 2px solid #ff7eb3;
  }
  
  .workspace-content {
	margin-top: 2rem;
  }
  </style>