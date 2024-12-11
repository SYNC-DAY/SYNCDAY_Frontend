<template>
    <Dialog v-model:visible="isVisible" modal header="일정 생성" :style="{ width: '50vw' }" :breakpoints="{ '960px': '75vw', '641px': '90vw' }" @hide="onClose">
        <div class="p-fluid">
            <div class="field mb-4">
                <label for="title" class="font-bold">일정 제목</label>
                <InputText id="title" v-model="scheduleForm.title" placeholder="일정 제목을 입력하세요" />
            </div>

            <div class="field mb-4">
                <label class="font-bold mb-2">시간</label>
                <div class="flex gap-2">
                    <Dropdown v-model="scheduleForm.hour" :options="hourOptions" placeholder="시간" class="w-6" />
                    <Dropdown v-model="scheduleForm.minute" :options="minuteOptions" placeholder="분" class="w-6" />
                </div>
            </div>

            <div class="field mb-4">
                <label for="description" class="font-bold">설명</label>
                <Textarea id="description" v-model="scheduleForm.description" rows="3" placeholder="일정에 대한 설명을 입력하세요" />
            </div>
        </div>

        <template #footer>
            <Button label="취소" icon="pi pi-times" @click="onClose" class="p-button-text" />
            <Button label="저장" icon="pi pi-check" @click="onSave" autofocus />
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

    // 모달 표시 상태
    const isVisible = ref(props.visible);

    // 시간 옵션 생성 (0-23시)
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        label: `${i.toString().padStart(2, '0')}시`,
        value: i
    }));

    // 분 옵션 생성 (15분 단위)
    const minuteOptions = [0, 15, 30, 45].map((min) => ({
        label: `${min.toString().padStart(2, '0')}분`,
        value: min
    }));

    // 폼 데이터
    const scheduleForm = ref({
        title: '',
        hour: null,
        minute: null,
        description: ''
    });

    // visible prop 변경 감지
    watch(
        () => props.visible,
        (newValue) => {
            isVisible.value = newValue;
        }
    );

    // isVisible 변경 감지
    watch(isVisible, (newValue) => {
        emit('update:visible', newValue);
    });

    // 모달 닫기
    const onClose = () => {
        resetForm();
        emit('close');
    };

    // 저장
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

    // 폼 초기화
    const resetForm = () => {
        scheduleForm.value = {
            title: '',
            hour: null,
            minute: null,
            description: ''
        };
    };
</script>
