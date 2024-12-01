<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="새 프로젝트 추가"
		:style="{ width: '50vw' }" :closable="true">
		<div class="modal-content">
			<!-- Form content will go here -->
			<form @submit.prevent="handleSubmit">
				<span class="block text-surface-500 mb-8">New Project Title</span>
				<InputText id="projName" v-model="formData.projName" class="w-full"
					:class="{ 'p-invalid': errors.projName }" />
				<small class="text-red-500" v-if="errors.projName">{{ errors.projName }}</small>

				<div class="mb-4">
					<label for="startDate" class="block mb-2">시작일</label>
					<Calendar id="startDate" v-model="formData.startDate" class="w-full" :showIcon="true"
						dateFormat="yy-mm-dd" />
				</div>

				<div class="mb-4">
					<label for="endDate" class="block mb-2">종료일</label>
					<Calendar id="endDate" v-model="formData.endDate" class="w-full" :showIcon="true"
						dateFormat="yy-mm-dd" :minDate="formData.startDate" />
				</div>
			</form>
		</div>

		<template #footer>
			<div class="flex justify-end gap-2">
				<Button label="취소" @click="handleCancel" class="p-button-secondary" />
				<Button label="생성" @click="handleSubmit" :loading="isSubmitting" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';

const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	}
});

const emit = defineEmits([
	'update:visible',
	'submit'
]);

// Form data
const formData = reactive({
	projName: '',
	startDate: null,
	endDate: null
});

const errors = reactive({
	projName: ''
});

const isSubmitting = ref(false);

// Methods
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);
	if (!newValue) {
		resetForm();
	}
};

const handleSubmit = async () => {
	// Validate
	if (!formData.projName.trim()) {
		errors.projName = '프로젝트 이름을 입력해주세요';
		return;
	}

	try {
		isSubmitting.value = true;

		const projectData = {
			name: formData.projName,
			startTime: formData.startDate,
			endTime: formData.endDate
		};

		emit('submit', projectData);
		handleVisibilityChange(false);
	} catch (error) {
		console.error('Project creation failed:', error);
	} finally {
		isSubmitting.value = false;
	}
};

const handleCancel = () => {
	handleVisibilityChange(false);
};

const resetForm = () => {
	formData.projName = '';
	formData.startDate = null;
	formData.endDate = null;
	errors.projName = '';
};

// Debug logging
const debug = {
	log: (...args) => console.log('[NewProjModal]', ...args),
	error: (...args) => console.error('[NewProjModal]', ...args)
};

// Add watchers for debugging
watch(() => props.visible, (newVal) => {
	debug.log('Visibility changed:', newVal);
});

watch(formData, (newVal) => {
	debug.log('Form data changed:', newVal);
}, { deep: true });
</script>

<style scoped>
.modal-content {
	padding: 1rem;
}



:deep(.p-calendar) {
	width: 100%;
}

:deep(.p-inputtext) {
	width: 100%;
}
</style>