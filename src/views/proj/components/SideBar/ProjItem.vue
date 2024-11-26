<!-- ProjItem.vue -->
<template>
	<div class="proj-item">
		<div class="proj-left"></div>
		<div class="proj-title">
			<span>{{ title }}</span>
		</div>
		<div class="proj-right">
			<i class="pi pi-bookmark"></i>
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
	isExpanded: {  // Changed from initialExpanded
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

const emit = defineEmits(['toggle-expansion', 'select', 'bookmark-changed'])

const isBookmarked = ref(props.initialBookmarked)

const handleExpand = () => {
	emit('toggle-expansion')
}

const handleSelect = () => {
	emit('select')
}

const toggleBookmark = () => {
	isBookmarked.value = !isBookmarked.value
	emit('bookmark-changed', isBookmarked.value)
}
</script>
<style scoped>
.proj-item {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	border-bottom: 1px solid var(--outline-gray);
	width: 18rem;
	height: 4rem;
	overflow: hidden;
}

.proj-item>* {
	/* border: 1px solid var(--outline-gray) */
}

.proj-left {
	width: 1.2rem;
	height: 100%;
	background-color: var(--pink-color)
		/* fill: grad */
}

.proj-title {
	width: auto;
	height: 100%;
	overflow-x: hidden;
}

.proj-right {
	margin-right: 0;
	width: 3rem;
	height: 100%;
	background-color: var(--background-gray);
	position: relative;
	display: flex;
	justify-content: center;
}

.proj-right i {
	position: absolute;
	top: -3px;
	font-size: 2rem;
	color: transparent;
	background: linear-gradient(90deg, var(--pink-color), var(--apricot-color));
	background-clip: text;
}

.proj-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	padding: 0.75rem;
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

.proj-title span {
	cursor: pointer;
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
	color: var(--apricot-color);
}

.proj-content {
	padding: 0.5rem;
}
</style>