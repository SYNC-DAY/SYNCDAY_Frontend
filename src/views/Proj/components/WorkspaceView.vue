<!-- WorkspaceView.vue -->
<template>
	<div v-if="workspace" class="max-w-6xl mx-auto px-4">
	  <div class="mb-6">
		<h1 class="text-2xl font-semibold mb-2">{{ workspace.workspace_name }}</h1>
		<div class="text-sm text-gray-600">생성일: {{ formatDate(workspace.created_at) }}</div>
	  </div>
  
	  <div class="workspace-header bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
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
			class="h-full rounded-full bg-gradient-to-r from-[#ff7eb3] to-[#ff9f7d] transition-all duration-300"
			:style="{ width: `${workspace.progress_status}%` }"
		  ></div>
		</div>
	  </div>
  
	  <div class="flex justify-between items-center mb-6">
		<div class="flex gap-6 border-b border-gray-200">
		  <button
			v-for="tab in tabs"
			:key="tab.id"
			class="py-2 px-4 relative"
			:class="[
			  activeTab === tab.id 
				? 'text-[#ff7eb3] font-medium' 
				: 'text-gray-600'
			]"
			@click="activeTab = tab.id"
		  >
			{{ tab.name }}
			<div 
			  v-if="activeTab === tab.id"
			  class="absolute bottom-0 left-0 w-full h-0.5 bg-[#ff7eb3]"
			></div>
		  </button>
		</div>
		<div class="flex gap-2">
		  <button 
			class="px-4 py-1.5 rounded-full text-sm"
			:class="[
			  viewMode === 'card' 
				? 'bg-[#ff7eb3] text-white' 
				: 'bg-white border border-gray-200'
			]"
			@click="viewMode = 'card'"
		  >
			Card
		  </button>
		  <button 
			class="px-4 py-1.5 rounded-full text-sm"
			:class="[
			  viewMode === 'board' 
				? 'bg-[#ff7eb3] text-white' 
				: 'bg-white border border-gray-200'
			]"
			@click="viewMode = 'board'"
		  >
			Board
		  </button>
		  <button class="p-1.5 border border-gray-200 rounded-lg">
			<i class="filter-icon"></i>
		  </button>
		</div>
	  </div>
  
	  <div v-if="activeTab === 'board'" class="workspace-boards grid grid-cols-3 gap-6">
		<div 
		  v-for="board in boards"
		  :key="board.id"
		  class="board bg-pink-50 p-4 rounded-lg"
		>
		  <h3 class="font-medium mb-4">{{ board.name }}</h3>
		  <div class="space-y-2">
			<div 
			  v-for="card in board.cards"
			  :key="card.id"
			  class="card bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-[#ff7eb3] hover:-translate-y-0.5 transition-all"
			>
			  <div class="flex items-center gap-2">
				<div 
				  class="w-1 h-full rounded-full"
				  :class="card.colorClass"
				></div>
				{{ card.title }}
			  </div>
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
  import { ref, computed } from 'vue';
  import axios from 'axios';
  
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
  });
  
  // State
  const activeTab = ref('board');
  const viewMode = ref('card');
  
  // Constants
  const tabs = [
	{ id: 'board', name: '보드' },
	{ id: 'kanban', name: '칸반' },
	{ id: 'calendar', name: '캘린더' }
  ];
  
  const boards = [
	{
	  id: 1,
	  name: 'Board 1',
	  cards: [
		{ id: 1, title: 'Card 1', colorClass: 'bg-red-500' },
		{ id: 2, title: 'Card 2', colorClass: 'bg-green-500' },
		{ id: 3, title: 'Card 3', colorClass: 'bg-yellow-500' },
		{ id: 4, title: 'Card 4', colorClass: 'bg-blue-500' }
	  ]
	},
	{
	  id: 2,
	  name: 'Board 2',
	  cards: [
		{ id: 5, title: 'Card 1', colorClass: 'bg-purple-500' },
		{ id: 6, title: 'Card 2', colorClass: 'bg-indigo-500' }
	  ]
	},
	{
	  id: 3,
	  name: 'Board 3',
	  cards: [
		{ id: 7, title: 'Card 1', colorClass: 'bg-pink-500' },
		{ id: 8, title: 'Card 2', colorClass: 'bg-orange-500' },
		{ id: 9, title: 'Card 3', colorClass: 'bg-teal-500' }
	  ]
	}
  ];
  
  // Computed
  const workspace = computed(() => {
	const project = props.projects.find(p => p.proj_id === parseInt(props.projectId));
	if (!project) return null;
	return project.workspaces.find(w => w.workspace_id === parseInt(props.workspaceId));
  });
  
  // Methods
  const formatDate = (dateString) => {
	if (!dateString) return '';
	return new Date(dateString).toLocaleDateString('ko-KR', {
	  year: 'numeric',
	  month: 'long',
	  day: 'numeric'
	});
  };
  
  const fetchWorkspace = async () => {
	try {
	  const response = await axios.get(`/api/workspaces/${props.workspaceId}`);
	  if (response.data.success) {
		console.log(response.data.data);
	  }
	} catch (e) {
	  console.error(e);
	}
  };
  
  // Call fetchWorkspace when component mounts
  // onMounted(() => {
  //   fetchWorkspace();
  // });
  </script>
  
  <style scoped>
  .card {
	cursor: pointer;
	transition: all 0.2s;
  }
  
  .card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  }
  
  .workspace-boards {
	height: calc(100vh - 300px);
	overflow-x: auto;
  }
  
  .filter-icon {
	display: inline-block;
	width: 20px;
	height: 20px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'/%3E%3C/svg%3E");
  }
  </style>