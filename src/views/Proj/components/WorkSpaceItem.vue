<!-- WorkSpaceItem.vue -->
<template>
	<div class="workspace-item" :class="{ 'active': isActive }">
	  <div 
		class="workspace-header"
		@click="$emit('select')"
	  >
		<span class="title">{{ title }}</span>
		<button 
		  class="bookmark-btn"
		  @click.stop="toggleBookmark"
		>
		  <span :class="['star-icon', { 'bookmarked': isBookmarked }]">★</span>
		</button>
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
	}
  })
  
  defineEmits(['select'])
  
  const isBookmarked = ref(false)
  
  const toggleBookmark = () => {
	isBookmarked.value = !isBookmarked.value
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