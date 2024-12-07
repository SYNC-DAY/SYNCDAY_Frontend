<template>
	<div class="proj-item">
		<div class="proj-section container-row" @click="handleSelect">
			<div class="proj-left" :class="{ 'gradient-vertical': isActive }"></div>
			<div class="proj-title container-row">
				<span>{{ props.proj?.proj_name }}</span>
			</div>
			<div class="proj-right container-col">
				<div class="bookmark-section" @click.stop="handleBookmark">
					<i class="pi gradient-vertical" :class="{
						'pi-bookmark': !isBookmarked,
						'pi-bookmark-fill': isBookmarked
					}">
					</i>
				</div>
				<div class="chevron-section">
					<i class="pi" :class="{ 'pi-chevron-down': !isExpanded, 'pi-chevron-up': isExpanded }"
						@click.stop="handleExpand">
					</i>
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
	import { computed, ref } from 'vue';
	import { useProjectStore } from '@/stores/proj/useProjectStore';
	import { useToast } from 'primevue/usetoast';

	const projectStore = useProjectStore();
	const toast = useToast();

	const props = defineProps({
		proj: {
			type: Object,
			required: true
		},
		projId: {
			type: Number,
			required: true
		},
		userId: {
			type: Number,
			required: true
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

	// Local state for optimistic updates
	const localBookmarkStatus = ref(props.proj?.bookmark_status || 'NONE');

	const isBookmarked = computed(() => {
		return localBookmarkStatus.value === 'BOOKMARKED';
	});

	const handleBookmark = async (event) => {
		try {
			event.stopPropagation();

			if (!props.proj?.proj_member_id) {
				console.error('Missing proj_member_id');
				return;
			}

			// Optimistic update
			const newStatus = localBookmarkStatus.value === 'BOOKMARKED' ? 'NONE' : 'BOOKMARKED';
			localBookmarkStatus.value = newStatus;

			// Actually update the bookmark
			const result = await projectStore.handleBookmark(props.proj.proj_member_id, props.projId);

			// Update local state with the actual result
			localBookmarkStatus.value = result;

			emit('bookmark-changed', props.projId);

		} catch (error) {
			// Revert optimistic update on error
			localBookmarkStatus.value = props.proj?.bookmark_status || 'NONE';

			toast.add({
				severity: 'error',
				summary: '북마크 실패',
				detail: '북마크 상태를 변경하는 중 오류가 발생했습니다.',
				life: 3000
			});
		}
	};

	const handleExpand = (event) => {
		event.stopPropagation();
		emit('toggle-expansion');
	};

	const handleSelect = () => {
		emit('select');
	};
</script>