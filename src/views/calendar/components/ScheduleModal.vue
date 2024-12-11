<template>
    <Dialog v-model:visible="isVisible" modal header="일정 생성" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }" @hide="onClose" class="schedule-modal">
        <div class="p-fluid">
            <!-- 선택된 날짜 표시 -->
            <div class="selected-date mb-6">
                <span class="block text-xl font-bold text-gray-800">
                    {{ formatDate(props.selectedDate) }}
                </span>
            </div>

            <div class="field mb-6">
                <label for="title" class="block text-lg font-semibold mb-3">일정 제목</label>
                <InputText id="title" v-model="scheduleForm.title" placeholder="일정 제목을 입력하세요" class="p-3" />
            </div>

            <div class="field mb-6">
                <label class="block text-lg font-semibold mb-3">시간</label>
                <div class="flex gap-4">
                    <div class="w-40">
                        <Dropdown v-model="scheduleForm.hour" :options="hours" optionLabel="text" optionValue="value" placeholder="시간" class="w-full" />
                    </div>
                    <div class="w-40">
                        <Dropdown v-model="scheduleForm.minute" :options="minutes" optionLabel="text" optionValue="value" placeholder="분" class="w-full" />
                    </div>
                </div>
            </div>

            <div class="field mb-6">
                <label for="description" class="block text-lg font-semibold mb-3">설명</label>
                <Textarea id="description" v-model="scheduleForm.description" rows="3" placeholder="일정에 대한 설명을 입력하세요" class="p-3" />
            </div>
        </div>

        <template #footer>
            <div class="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Button label="취소" icon="pi pi-times" @click="onClose" class="p-button-text" />
                <Button label="저장" icon="pi pi-check" @click="onSave" autofocus />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
    import Button from 'primevue/button';
    import Dialog from 'primevue/dialog';
    import Dropdown from 'primevue/dropdown';
    import InputText from 'primevue/inputtext';
    import Textarea from 'primevue/textarea';
    import { defineEmits, defineProps, ref, watch } from 'vue';

    const props = defineProps({
        visible: {
            type: Boolean,
            required: true
        },
        selectedDate: {
            type: Date,
            required: true
        }
    });

    const emit = defineEmits(['update:visible', 'close', 'save']);

    const isVisible = ref(props.visible);

    // 시간 옵션 (0-23시)
    const hours = Array.from({ length: 24 }, (_, i) => ({
        text: `${i.toString().padStart(2, '0')}시`,
        value: i
    }));

    // 분 옵션 (15분 단위)
    const minutes = [0, 15, 30, 45].map((min) => ({
        text: `${min.toString().padStart(2, '0')}분`,
        value: min
    }));

    const scheduleForm = ref({
        title: '',
        hour: null,
        minute: null,
        description: ''
    });

    // 날짜 포맷 함수
    const formatDate = (date) => {
        if (!date) return '';

        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = days[date.getDay()];

        return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
    };

    watch(
        () => props.visible,
        (newValue) => {
            isVisible.value = newValue;
        }
    );

    watch(isVisible, (newValue) => {
        emit('update:visible', newValue);
    });

    const onClose = () => {
        resetForm();
        emit('close');
    };

    const onSave = () => {
        const scheduleDate = new Date(props.selectedDate);
        scheduleDate.setHours(scheduleForm.value.hour || 0);
        scheduleDate.setMinutes(scheduleForm.value.minute || 0);

        const scheduleData = {
            title: scheduleForm.value.title,
            date: scheduleDate,
            description: scheduleForm.value.description
        };

        emit('save', scheduleData);
        resetForm();
    };

    const resetForm = () => {
        scheduleForm.value = {
            title: '',
            hour: null,
            minute: null,
            description: ''
        };
    };
</script>

<style scoped>
    .schedule-modal :deep(.p-dialog-content) {
        padding: 2rem;
    }

    .schedule-modal :deep(.p-dialog-header) {
        padding: 1.5rem 2rem;
        border-bottom: 1px solid #e5e7eb;
    }

    .schedule-modal :deep(.p-dialog-header-content) {
        font-size: 1.25rem;
        font-weight: 600;
    }

    .schedule-modal :deep(.p-dialog-footer) {
        padding: 1.5rem 2rem;
    }

    .schedule-modal :deep(.p-inputtext),
    .schedule-modal :deep(.p-dropdown) {
        padding: 0.75rem 1rem;
    }

    .schedule-modal :deep(.p-dropdown-panel) {
        margin-top: 4px;
    }

    .schedule-modal :deep(.p-button) {
        padding: 0.75rem 1.5rem;
    }

    .schedule-modal :deep(.p-button.p-button-text) {
        padding: 0.75rem 1.5rem;
    }
</style>
