<template>
    <div class="calendar-wrapper">
        <Card>
            <template #title>
                <div class="calendar-header">
                    <h2>일정 관리</h2>
                    <Button icon="pi pi-plus" label="일정 추가" @click="showEventDialog" />
                </div>
            </template>
            <template #content>
                <Calendar v-model="selectedDate" :inline="true" :showWeek="true" :locale="locale" selectionMode="multiple" :selection-mode="isRangeSelect ? 'range' : 'single'" :class="{ 'p-invalid': validationError }" @date-select="onDateSelect" />
            </template>
        </Card>

        <!-- 일정 추가/수정 다이얼로그 -->
        <Dialog v-model:visible="eventDialogVisible" :modal="true" :header="dialogMode === 'add' ? '일정 추가' : '일정 수정'" :style="{ width: '450px' }">
            <div class="p-fluid">
                <div class="field">
                    <label for="title">제목</label>
                    <InputText id="title" v-model="eventForm.title" required :class="{ 'p-invalid': titleError }" />
                    <small class="p-error" v-if="titleError">제목을 입력해주세요.</small>
                </div>

                <div class="field">
                    <label>날짜 선택</label>
                    <div class="flex gap-2">
                        <Calendar v-model="eventForm.startDate" showTime :showIcon="true" :class="{ 'p-invalid': dateError }" />
                        <Calendar v-model="eventForm.endDate" showTime :showIcon="true" :class="{ 'p-invalid': dateError }" />
                    </div>
                    <small class="p-error" v-if="dateError">유효한 날짜를 선택해주세요.</small>
                </div>

                <div class="field">
                    <label for="description">설명</label>
                    <Textarea id="description" v-model="eventForm.description" rows="3" autoResize />
                </div>

                <div class="field-checkbox">
                    <Checkbox id="allDay" v-model="eventForm.allDay" :binary="true" />
                    <label for="allDay">종일</label>
                </div>
            </div>

            <template #footer>
                <Button label="취소" icon="pi pi-times" @click="hideEventDialog" class="p-button-text" />
                <Button label="저장" icon="pi pi-check" @click="saveEvent" autofocus />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
    import { useToast } from 'primevue/usetoast';
    import { onMounted, reactive, ref } from 'vue';

    // 캘린더 locale 설정
    const locale = {
        firstDayOfWeek: 0,
        dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        today: '오늘',
        clear: '초기화'
    };

    // 상태 관리
    const selectedDate = ref(null);
    const eventDialogVisible = ref(false);
    const dialogMode = ref('add');
    const isRangeSelect = ref(false);
    const validationError = ref(false);
    const titleError = ref(false);
    const dateError = ref(false);

    // 이벤트 폼 데이터
    const eventForm = reactive({
        title: '',
        startDate: null,
        endDate: null,
        description: '',
        allDay: false
    });

    // Toast 메시지
    const toast = useToast();

    // 일정 추가 다이얼로그 표시
    const showEventDialog = () => {
        dialogMode.value = 'add';
        resetForm();
        eventDialogVisible.value = true;
    };

    // 다이얼로그 닫기
    const hideEventDialog = () => {
        eventDialogVisible.value = false;
        resetForm();
    };

    // 폼 초기화
    const resetForm = () => {
        eventForm.title = '';
        eventForm.startDate = null;
        eventForm.endDate = null;
        eventForm.description = '';
        eventForm.allDay = false;
        titleError.value = false;
        dateError.value = false;
    };

    // 날짜 선택 핸들러
    const onDateSelect = (event) => {
        const selectedDate = new Date(event.value);
        eventForm.startDate = selectedDate;
        eventForm.endDate = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
        showEventDialog();
    };

    // 일정 저장
    const saveEvent = () => {
        if (validateForm()) {
            // TODO: 실제 저장 로직 구현
            toast.add({
                severity: 'success',
                summary: '성공',
                detail: '일정이 저장되었습니다.',
                life: 3000
            });
            hideEventDialog();
        }
    };

    // 폼 유효성 검사
    const validateForm = () => {
        let isValid = true;

        if (!eventForm.title.trim()) {
            titleError.value = true;
            isValid = false;
        } else {
            titleError.value = false;
        }

        if (!eventForm.startDate || !eventForm.endDate || eventForm.endDate < eventForm.startDate) {
            dateError.value = true;
            isValid = false;
        } else {
            dateError.value = false;
        }

        return isValid;
    };

    onMounted(() => {
        selectedDate.value = new Date();
    });
</script>

<style scoped>
    .calendar-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
    }

    .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .field {
        margin-bottom: 1.5rem;
    }

    .field label {
        display: block;
        margin-bottom: 0.5rem;
    }

    .field-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    :deep(.p-calendar) {
        width: 100%;
    }

    :deep(.p-datepicker) {
        min-width: 100%;
    }

    :deep(.p-dialog-footer) {
        text-align: right;
    }

    :deep(.p-card) {
        margin-bottom: 1rem;
    }

    .flex {
        display: flex;
    }

    .gap-2 {
        gap: 0.5rem;
    }
</style>
