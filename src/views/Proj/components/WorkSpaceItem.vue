
<!-- WorkspaceItem.vue -->
<template>
	<div class="workspace-item" :class="{ 'active': isActive }">
	  <div 
		class="workspace-header"
		@click="$emit('select')"
	  >
		<div class="workspace-info">
		  <span class="title">{{ title }}</span>
		  <span v-if="vcsInfo.type" class="vcs-badge" :title="vcsInfo.url">
			{{ vcsInfo.type }}
		  </span>
		</div>
		<div class="workspace-actions">
		  <div class="progress-bar" :title="`Progress: ${progress}%`">
			<div 
			  class="progress-fill"
			  :style="{ width: `${progress}%` }"
			></div>
		  </div>
		  <button 
			class="bookmark-btn"
			@click.stop="toggleBookmark"
		  >
			<span :class="['star-icon', { 'bookmarked': isBookmarked }]">★</span>
		  </button>
		</div>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
	title: {
	  type: String,
	  required: true
	},
	isActive: {
	  type: Boolean,
	  default: false
	},
	initialBookmarked: {
	  type: Boolean,
	  default: false
	},
	progress: {
	  type: Number,
	  default: 0
	},
	vcsInfo: {
	  type: Object,
	  default: () => ({ type: null, url: null })
	}
  })
  
  const emit = defineEmits(['select', 'bookmark-changed'])
  
  const isBookmarked = ref(props.initialBookmarked)
  
  const toggleBookmark = () => {
	isBookmarked.value = !isBookmarked.value
	emit('bookmark-changed', isBookmarked.value)
  }
  </script>
  
  <style scoped>
  .workspace-item {
	position: relative;
  }
  
  .workspace-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	cursor: pointer;
	transition: background-color 0.2s;
  }
  
  .workspace-header:hover {
	background-color: var(--hover-color, #f5f5f5);
  }
  
  .workspace-item.active .workspace-header {
	background-color: var(--background-active);
  }
  
  .workspace-item.active::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 3px;
	background: linear-gradient(to bottom, #ff7eb3, #ff9f7d);
  }
  
  .workspace-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
  }
  
  .vcs-badge {
	font-size: 0.75rem;
	padding: 0.125rem 0.375rem;
	background-color: var(--outline-gray);
	border-radius: 0.25rem;
	color: var(--text-secondary);
  }
  
  .workspace-actions {
	display: flex;
	align-items: center;
	gap: 0.75rem;
  }
  
  .progress-bar {
	width: 60px;
	height: 4px;
	background-color: var(--outline-gray);
	border-radius: 2px;
	overflow: hidden;
  }
  
  .progress-fill {
	height: 100%;
	background: linear-gradient(to right, #ff7eb3, #ff9f7d);
	transition: width 0.3s ease;
  }
  
  .title {
	font-weight: 400;
  }
  
  .bookmark-btn {
	background: none;
	border: none;
	padding: 0.25rem;
	cursor: pointer;
	color: var(--background-active);
	transition: color 0.2s;
  }
  
  .star-icon {
	font-size: 1rem;
  }
  
  .star-icon.bookmarked {
	color: var(--apricot-color);
  }
  </style>