<template>
	<Dialog
		v-model:visible="dialogVisible"
		:header="'태그 관리'"
		:style="{ width: '30rem' }"
		modal>
		<!-- Header with Add Button -->
		<div class="header-row">
			<Button
				icon="pi pi-plus"
				@click="openAddTagDialog" />
		</div>

		<!-- Tag List -->
		<div v-if="tags.length > 0">
			<div class="tags-container">
				<div
					v-for="tag in tags"
					:key="tag.value"
					:style="{
						backgroundColor: getBackgroundWithOpacity(tag.color, 0.125),
						color: tag.color,
						padding: '4px 8px',
						borderRadius: '4px',
						margin: '4px',
						display: 'inline-block',
					}">
					{{ tag.name }}
					<Button
						icon="pi pi-times"
						class="custom-delete-button"
						@click="deleteTag(tag)" />
				</div>
			</div>
		</div>
		<div v-else>
			<p>태그가 없습니다.</p>
		</div>

		<!-- Add Tag Dialog -->
		<Dialog
			v-model:visible="addTagDialogVisible"
			:header="'새 태그 추가'"
			:style="{ width: '30rem' }"
			modal>
			<div class="add-tag-form">
				<div class="form-row">
					<span>태그 이름 입력: </span>
					<InputText
						v-model="newTagName"
						placeholder="태그 이름을 입력하세요" />
				</div>

				<div class="form-row">
					<span>색상 설정: </span>
					<Button
						label="색상 선택"
						icon="pi pi-palette"
						class="p-button-outlined"
						@click="toggleColorPicker" />
				</div>

				<!-- Color Picker -->
				<div
					v-if="showColorPicker"
					class="color-picker-popup">
					<ColorPicker
						v-model="newTagColor"
						inline />
				</div>

				<div class="form-actions">
					<Button
						label="추가"
						icon="pi pi-check"
						@click="addNewTag" />
				</div>
			</div>
		</Dialog>
	</Dialog>
</template>

<script setup>
	import { ref, computed, onMounted } from "vue";
	import axios from "axios";
	import Dialog from "primevue/dialog";
	import Button from "primevue/button";
	import InputText from "primevue/inputtext";
	import ColorPicker from "primevue/colorpicker";

	const props = defineProps({
		modelValue: {
			type: Boolean,
			required: true,
		},
		workspaceId: {
			type: [String, Number],
			required: true,
		},
	});

	const emit = defineEmits(["update:modelValue", "update:tags"]);

	// State
	const tags = ref([]);
	const addTagDialogVisible = ref(false);
	const newTagName = ref("");
	const newTagColor = ref("#FFFFFF");
	const showColorPicker = ref(false);

	// Computed
	const dialogVisible = computed({
		get: () => props.modelValue,
		set: value => emit("update:modelValue", value),
	});

	// Methods
	const fetchTags = async () => {
		try {
			const response = await axios.get(`card-tags/tag/${props.workspaceId}`);
			tags.value = response.data.data.map(tag => ({
				name: tag.tag_name,
				value: tag.tag_id,
				color: tag.color,
			}));
			emit("update:tags", tags.value);
		} catch (error) {
			console.error("Failed to fetch tags:", error);
		}
	};

	const openAddTagDialog = () => {
		newTagName.value = "";
		newTagColor.value = "#FFFFFF";
		showColorPicker.value = false;
		addTagDialogVisible.value = true;
	};

	const toggleColorPicker = () => {
		showColorPicker.value = !showColorPicker.value;
	};

	const getBackgroundWithOpacity = (color, opacity) => {
		const hex = color.replace("#", "");
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	};

	const addNewTag = async () => {
		if (!newTagName.value.trim()) {
			alert("태그 이름을 입력하세요!");
			return;
		}

		try {
			const response = await axios.post("card-tags/", {
				tag_name: newTagName.value,
				color: newTagColor.value,
				workspace_id: props.workspaceId,
			});

			if (response.data.success) {
				await fetchTags();
				addTagDialogVisible.value = false;
				newTagName.value = "";
				newTagColor.value = "#FFFFFF";
			}
		} catch (error) {
			console.error("태그 추가 실패:", error);
			alert("태그 추가 중 오류가 발생했습니다.");
		}
	};

	const deleteTag = async tag => {
		try {
			const response = await axios.delete(`/card-tags/${tag.value}`);
			if (response.data.success) {
				await fetchTags();
			}
		} catch (error) {
			console.error("태그 삭제 실패:", error);
			alert("태그 삭제 중 오류가 발생했습니다.");
		}
	};

	// Lifecycle
	onMounted(() => {
		fetchTags();
	});
</script>

<style scoped>
	.header-row {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.form-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.add-tag-form {
		padding: 1rem;
	}

	.color-picker-popup {
		margin-top: 1rem;
	}

	.custom-delete-button {
		width: 1.5rem;
		height: 1.5rem;
		margin-left: 0.5rem;
		padding: 0;
	}
</style>
