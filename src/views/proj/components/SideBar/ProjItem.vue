<!-- ProjItem.vue -->
<template>
	<div class="proj-item">
		<div class="proj-section container-row" @click="handleSelect">
			<div class="proj-left" :class="{ 'background-gradient': isActive }"></div>
			<div class="proj-title container-row">
				<span>{{ title }}</span>
			</div>
			<div class="proj-right container-column">
				<div class="bookmark-section" @click.stop="toggleBookmark">
					<i class="pi background-gradient"
						:class="{ 'pi-bookmark': !isBookmarked, 'pi-bookmark-fill': isBookmarked }"></i>
				</div>
				<div class="chevron-section">
					<i class="pi" :class="{ 'pi-chevron-down': !isExpanded, 'pi-chevron-up': isExpanded }"
						@click="handleExpand"></i>
				</div>
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
	border-bottom: 1px solid var(--outline-gray);
}

.proj-section {

	width: 100%;
	height: 5rem;
	overflow: hidden;

}

.proj-section>* {
	/* border: 1px solid var(--outline-gray) */
}

.proj-left {
	width: 1.5rem;
	height: 100%;
	/* fill: grad */
}



.proj-title {
	width: auto;
	padding-left: 0.4rem;
	height: 100%;
	overflow-x: hidden;
	cursor: pointer;
}

.proj-right {
	margin-right: 0;
	width: 3rem;
	height: 100%;
	background-color: var(--background-gray);
	position: relative;


}

.proj-right div {
	flex: 1;
	/* border: 1px solid black; */
	display: flex;
	flex-direction: row;
	justify-content: center;
}

.bookmark-section {
	cursor: pointer;
}

.proj-right>.bookmark-section>i {
	position: absolute;
	top: -3px;
	font-size: 2rem;
	color: transparent;
	/* background: linear-gradient(180deg, var(--pink-color) 50%, var(--apricot-color)); */
	background-clip: text;
}



.chevron-section {
	cursor: pointer;
}

.proj-right>.chevron-section>i {
	position: absolute;
	bottom: 0.2rem;
	vertical-align: bottom;
	/* border: 1px solid black; */
}
</style>