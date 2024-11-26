<!-- ProjItem.vue -->
<template>
	<div class="proj-item" @click="handleSelect">
		<div class="proj-left" :class="{ 'active': isActive }"></div>
		<div class="proj-title">
			<span>{{ title }}</span>
		</div>
		<div class="proj-right">
			<div class="bookmark-section">
				<i class="pi pi-bookmark"></i>
			</div>
			<div class="chevron-section">
				<i class="pi" :class="{ 'pi-chevron-down': !isExpanded, 'pi-chevron-up': isExpanded }"
					@click="handleExpand"></i>
			</div>
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
	align-items: center;
	border-bottom: 1px solid var(--outline-gray);
	width: 100%;
	height: 5rem;
	overflow: hidden;
}

.proj-item>* {
	/* border: 1px solid var(--outline-gray) */
}

.proj-left {
	width: 1.5rem;
	height: 100%;
	/* fill: grad */
}

.active {
	background: linear-gradient(to bottom, var(--pink-color),
			var(--apricot-color));
}

.proj-title {
	width: auto;
	padding-left: 0.4rem;
	height: 100%;
	overflow-x: hidden;
	display: flex;
	align-items: center
}

.proj-right {
	margin-right: 0;
	width: 3rem;
	height: 100%;
	background-color: var(--background-gray);
	position: relative;
	display: flex;
	flex-direction: column;

}

.proj-right div {
	flex: 1;
	/* border: 1px solid black; */
	display: flex;
	flex-direction: row;
	justify-content: center;
}

.proj-right>.bookmark-section>i {
	position: absolute;
	top: -2px;
	font-size: 2rem;
	color: transparent;
	background: linear-gradient(180deg, var(--pink-color) 60%, var(--apricot-color));
	background-clip: text;
}

.proj-right>.chevron-section>i {
	position: absolute;
	bottom: 0.2rem;
	vertical-align: bottom;
	/* border: 1px solid black; */
}
</style>