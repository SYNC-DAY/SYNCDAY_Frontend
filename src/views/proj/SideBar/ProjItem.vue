<template>
	<div class="proj-item">
		<div class="proj-section container-row" @click="handleSelect">
			<div class="proj-left" :class="{ 'gradient-vertical': isActive }"></div>
			<div class="proj-title container-row">
				<span>{{ props.proj?.proj_name }}</span>
			</div>
			<div class="proj-right container-col">
				<div class="bookmark-section" @click.stop="handleBookmark">
					<i class="pi gradient-vertical"
						:class="{ 'pi-bookmark': !isProjectBookmarked, 'pi-bookmark-fill': isProjectBookmarked }"></i>
				</div>
				<div class="chevron-section">
					<i class="pi" :class="{ 'pi-chevron-down': !isExpanded, 'pi-chevron-up': isExpanded }"
						@click.stop="handleExpand"></i>
				</div>
			</div>
		</div>
		<transition name="expand">
			<div v-show="isExpanded" class="proj-content">
				<slot></slot>
			</div>
		</transition>
	</div>
</template>

<script setup>
	import { computed } from 'vue';
	import { useAuthStore } from '@/stores/auth';
	import { useProjectStore } from '@/stores/proj/useProjectStore';
	import { storeToRefs } from 'pinia';

	const authStore = useAuthStore();
	const projectStore = useProjectStore();
	const { projects } = storeToRefs(projectStore);

	const props = defineProps({
		proj: {
			type: Object,
			Required: true
		},
		isActive: {
			type: Boolean,
			default: false
		},
		isExpanded: {
			type: Boolean,
			default: false
		},
		progress: {
			type: Number,
			default: 0,
			validator: value => value >= 0 && value <= 100
		}
	});

	const emit = defineEmits(['toggle-expansion', 'select', 'bookmark-changed']);

	// Computed properties
	const project = computed(() => projects.value[props.projectIndex]);
	const isProjectBookmarked = computed(() => project.value?.bookmark_status === 'BOOKMARKED');

	// Event handlers
	const handleBookmark = async () => {
		if (!project.value) return;

		const newBookmarkState = !isProjectBookmarked.value;
		try {
			await projectStore.handleBookmarkChange(
				authStore.user.userId,
				project.value.proj_id,
				newBookmarkState
			);
			emit('bookmark-changed', newBookmarkState);
		} catch (error) {
			console.error('Failed to toggle bookmark:', error);
			// You might want to show a toast message here
		}
	};

	const handleExpand = () => {
		emit('toggle-expansion');
	};

	const handleSelect = () => {
		emit('select');
	};
</script>

<style scoped>
	.proj-item {
		border-bottom: 1px solid var(--outline-gray);
	}

	.proj-section {
		width: 100%;
		height: 5rem;
		overflow: hidden;
		transition: background-color 0.3s ease;
	}

	.proj-section:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	.proj-left {
		width: 1.5rem;
		height: 100%;
		transition: opacity 0.3s ease;
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
		background-clip: text;
		transition: transform 0.3s ease, opacity 0.3s ease;
	}

	.proj-right>.bookmark-section>i:hover {
		transform: scale(1.1);
	}

	.chevron-section {
		cursor: pointer;
	}

	.proj-right>.chevron-section>i {
		position: absolute;
		bottom: 0.2rem;
		vertical-align: bottom;
		transition: transform 0.3s ease;
	}

	/* Expand/collapse transition */
	.expand-enter-active,
	.expand-leave-active {
		transition: max-height 0.3s ease, opacity 0.3s ease;
		max-height: 1000px;
		overflow: hidden;
	}

	.expand-enter-from,
	.expand-leave-to {
		max-height: 0;
		opacity: 0;
	}

	.expand-enter-to,
	.expand-leave-from {
		max-height: 1000px;
		opacity: 1;
	}

	/* Chevron rotation */
	.pi-chevron-down {
		transform: rotate(0deg);
		transition: transform 0.3s ease;
	}

	.pi-chevron-up {
		transform: rotate(180deg);
		transition: transform 0.3s ease;
	}
</style>