<template>
	<div class="proj-item">
		<div
			class="proj-section container-row"
			@click="handleSelect">
			<div
				class="proj-left"
				:class="{ 'gradient-vertical': isActive }"></div>
			<div class="proj-title container-row">
				<span>{{ props.proj?.proj_name }}</span>
			</div>
			<div class="proj-right container-col">
				<div
					class="bookmark-section"
					@click.stop="handleBookmark">
					<i
						class="pi gradient-vertical"
						:class="{
							'pi-bookmark': !isBookmarked,
							'pi-bookmark-fill': isBookmarked,
						}">
					</i>
				</div>
				<div class="chevron-section">
					<i
						class="pi"
						:class="{ 'pi-chevron-down': !isExpanded, 'pi-chevron-up': isExpanded }"
						@click.stop="handleExpand">
					</i>
				</div>
			</div>
		</div>
		<transition name="expand">
			<div
				v-show="isExpanded"
				class="proj-content">
				<slot></slot>
			</div>
		</transition>
	</div>
</template>

<script setup>
	import { computed, ref } from "vue";
	import { useProjectStore } from "@/stores/proj/useProjectStore";
	import { useToast } from "primevue/usetoast";

	const projectStore = useProjectStore();
	const toast = useToast();

	const props = defineProps({
		proj: {
			type: Object,
			required: true,
		},
		projId: {
			type: Number,
			required: true,
		},
		userId: {
			type: Number,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		isExpanded: {
			type: Boolean,
			default: false,
		},
		progress: {
			type: Number,
			default: 0,
			validator: value => value >= 0 && value <= 100,
		},
	});

	const emit = defineEmits(["toggle-expansion", "select", "bookmark-changed"]);

	// Local state for optimistic updates
	const localBookmarkStatus = ref(props.proj?.bookmark_status || "NONE");

	const isBookmarked = computed(() => {
		return localBookmarkStatus.value === "BOOKMARKED";
	});

	const handleBookmark = async event => {
		try {
			event.stopPropagation();

			if (!props.proj?.proj_member_id) {
				console.error("Missing proj_member_id");
				return;
			}

			// Optimistic update
			const newStatus = localBookmarkStatus.value === "BOOKMARKED" ? "NONE" : "BOOKMARKED";
			localBookmarkStatus.value = newStatus;

			// Actually update the bookmark
			const result = await projectStore.handleBookmark(props.proj.proj_member_id);

			// Update local state with the actual result
			localBookmarkStatus.value = result;

			emit("bookmark-changed", props.projId);
		} catch (error) {
			// Revert optimistic update on error
			localBookmarkStatus.value = props.proj?.bookmark_status || "NONE";

			toast.add({
				severity: "error",
				summary: "북마크 실패",
				detail: "북마크 상태를 변경하는 중 오류가 발생했습니다.",
				life: 3000,
			});
		}
	};

	const handleExpand = event => {
		event.stopPropagation();
		emit("toggle-expansion");
	};

	const handleSelect = () => {
		emit("select");
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

	.proj-right > .bookmark-section > i {
		position: absolute;
		top: -3px;
		font-size: 2rem;
		color: transparent;
		background-clip: text;
		transition: transform 0.3s ease, opacity 0.3s ease;
	}

	.proj-right > .bookmark-section > i:hover {
		transform: scale(1.1);
	}

	.chevron-section {
		cursor: pointer;
	}

	.proj-right > .chevron-section > i {
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
