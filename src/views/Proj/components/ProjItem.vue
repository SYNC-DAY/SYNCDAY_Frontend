<!-- ProjItem.vue -->
<template>
	<div class="proj-item">
	  <div 
		class="proj-header"
		:class="{ 'active': isActive }"
		@click="toggleExpand"
	  >
		<div class="proj-title">
		  <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
		  {{ title }}
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
	}
  })
  
  const isExpanded = ref(props.initialExpanded)
  const isBookmarked = ref(false)
  
  const toggleExpand = () => {
	isExpanded.value = !isExpanded.value
  }
  
  const toggleBookmark = () => {
	isBookmarked.value = !isBookmarked.value
  }
  </script>
  
  <style scoped>
  .proj-item {
	margin-bottom: 0.25rem;
  }
  
  .proj-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem 1rem;
	cursor: pointer;
	position: relative;
	transition: background-color 0.2s;
  }
  
  .proj-header:hover {
	background-color: var(--hover-color, #f5f5f5);
  }
  
  .proj-header.active {
	background-color: var(--active-color, #f0f0f0);
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
  
  .proj-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 500;
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