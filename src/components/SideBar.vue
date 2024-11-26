<!-- SideBar.vue -->
<template>
	<aside :class="['sidebar', { 'collapsed': isCollapsed }]">
		<button @click="toggleCollapse" class="collapse-btn" :title="isCollapsed ? '사이드바 열기' : '사이드바 접기'">
			{{ isCollapsed ? '>' : '<' }} </button>

				<div v-show="!isCollapsed" class="sidebar-content">
					<slot></slot>
				</div>
	</aside>
</template>

<script setup>
import { ref } from 'vue'

const isCollapsed = ref(false)
const searchQuery = ref('')

const toggleCollapse = () => {
	isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.sidebar {
	position: relative;
	width: 18rem;
	height: calc(100%-10vh);
	background-color: white;
	border-right: 1px solid var(--outline-gray);
	transition: width 0.3s ease;
	padding: 0.3rem;
}

.sidebar.collapsed {
	width: 0;
}

.collapse-btn {
	position: absolute;
	top: 1rem;
	right: -1.5rem;
	width: 1.5rem;
	height: 1.5rem;
	background-color: white;
	border: 1px solid var(--border-color, #eee);
	border-radius: 0 4px 4px 0;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.sidebar-content {
	height: 100%;
	overflow-y: auto;
}



.sidebar.collapsed .sidebar-content {
	display: none;
}
</style>