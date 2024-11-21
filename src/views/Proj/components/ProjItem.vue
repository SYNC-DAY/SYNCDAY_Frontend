
<!-- ProjItem.vue -->
<template>
	<div class="proj-item">
	  <div 
		class="proj-header"
		:class="{ 'active': isActive }"
		@click="$emit('click')"
	  >
		<div class="proj-title">
		  <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
		  {{ title }}
		  <span v-if="vcsInfo.type" class="vcs-badge" :title="vcsInfo.url">
			{{ vcsInfo.type }}
		  </span>
		</div>
		<div class="proj-actions">
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
	  
	  <div v-show="isExpanded" class="proj-content">
		<slot></slot>
	  </div>
	</div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
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
	},
	vcsInfo: {
	  type: Object,
	  default: () => ({ type: null, url: null })
	}
  })
  
  const emit = defineEmits(['click', 'bookmark-changed'])
  
  const isExpanded = ref(props.initialExpanded)
  const isBookmarked = ref(props.initialBookmarked)
  
  watch(() => props.isActive, (newVal) => {
	if (newVal) isExpanded.value = true
  })
  
  const toggleExpand = () => {
	isExpanded.value = !isExpanded.value
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
	align-items: center;
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
  
  .proj-title {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 500;
  }
  
  .vcs-badge {
	font-size: 0.75rem;
	padding: 0.125rem 0.375rem;
	background-color: var(--outline-gray);
	border-radius: 0.25rem;
	color: var(--text-secondary);
  }
  
  .proj-actions {
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
  