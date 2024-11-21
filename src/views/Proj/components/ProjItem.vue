<!-- ProjItem.vue -->
<template>
	<div class="proj-item">
	  <div 
		class="proj-header"
		:class="{ 'active': isActive }"
		@click="handleClick"
	  >
		<div class="proj-info">
		  <div class="proj-title">
			<span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
			{{ title }}
		  </div>
		  <div class="progress-info">
			<div class="progress-bar" :title="`Progress: ${progress}%`">
			  <div 
				class="progress-fill"
				:style="{ width: `${progress}%` }"
			  ></div>
			</div>
			<span class="progress-text">{{ progress }}%</span>
		  </div>
		</div>
		<button 
		  class="bookmark-btn"
		  @click.stop="toggleBookmark"
		>
		  <span :class="['star-icon', { 'bookmarked': isBookmarked }]">★</span>
		</button>
	  </div>
	  
	  <div v-show="isExpanded" class="proj-content">
		<slot></slot>
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
	initialExpanded: {
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
	}
  })
  
  const emit = defineEmits(['toggle', 'bookmark-changed'])
  
  const isExpanded = ref(props.initialExpanded)
  const isBookmarked = ref(props.initialBookmarked)
  
  const handleClick = () => {
	isExpanded.value = !isExpanded.value
	emit('toggle')
  }
  
  const toggleBookmark = () => {
	isBookmarked.value = !isBookmarked.value
	emit('bookmark-changed', isBookmarked.value)
  }
  </script>
  <style scoped>
  .proj-item {
	margin-bottom: 0.25rem;
  }
  
  .proj-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 0.75rem 1rem;
	cursor: pointer;
	position: relative;
	transition: background-color 0.2s;
  }
  
  .proj-header:hover {
	background-color: var(--outline-gray);
  }
  
  .proj-header.active::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	height: 100%;
	width: 3px;
	background: linear-gradient(to bottom, #ff7eb3, #ff9f7d);
  }
  
  .proj-info {
	flex-grow: 1;
	margin-right: 0.75rem;
  }
  
  .proj-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 500;
	margin-bottom: 0.5rem;
  }
  
  .progress-info {
	display: flex;
	align-items: center;
	gap: 0.5rem;
  }
  
  .progress-bar {
	width: 100px;
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
  
  .progress-text {
	font-size: 0.75rem;
	color: var(--text-secondary);
  }
  
  .expand-icon {
	font-size: 0.75rem;
	transition: transform 0.2s;
  }
  
  .bookmark-btn {
	background: none;
	border: none;
	padding: 0.25rem;
	cursor: pointer;
	color: #ccc;
	transition: color 0.2s;
  }
  
  .star-icon {
	font-size: 1rem;
  }
  
  .star-icon.bookmarked {
	color: #ff9f7d;
  }
  
  .proj-content {
	padding: 0.5rem 0 0.5rem 1.5rem;
  }
  </style>