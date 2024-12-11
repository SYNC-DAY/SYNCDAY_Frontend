<template>
    <div class="card p-6">
        <div class="mb-6 p-3">
            <div class="flex flex-col">
                <span class="text-lg font-semibold mb-2">직원 검색</span>
                <IconField class="">
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                    <InputText class="w-full" placeholder="직원 이름을 입력하세요" />
                </IconField>
            </div>
        </div>

        <div class="calendar-container mt-4">
            <Calendar v-model="selectedDate" :inline="true" showWeek :locale="locale" selectionMode="single" class="w-full" @date-select="onDateSelect" />
        </div>

        <ScheduleModal v-model:visible="showModal" :selected-date="selectedDate" @close="closeModal" @save="saveSchedule" />
    </div>
</template>

<script setup>
    import Calendar from 'primevue/calendar';
    import { ref } from 'vue';
    import ScheduleModal from './components/ScheduleModal.vue';

    const selectedDate = ref(new Date());
    const showModal = ref(false);

    const locale = {
        firstDayOfWeek: 0,
        dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
        dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        today: '오늘',
        clear: '초기화',
        dateFormat: 'yy-mm-dd',
        weekHeader: '주'
    };

    const onDateSelect = (value) => {
        selectedDate.value = value;
        showModal.value = true;
    };

    const closeModal = () => {
        showModal.value = false;
    };

    const saveSchedule = (scheduleData) => {
        console.log('저장된 일정:', scheduleData);
        closeModal();
    };
</script>

<style scoped>
    .calendar-container {
        max-width: 100%;
        margin: 0 auto;
    }

    :deep(.p-inputtext) {
        padding: 0.75rem 1rem;
    }

    :deep(.p-datepicker) {
        width: 100%;
        min-width: 100%;
        padding: 1rem;
    }

    :deep(.p-datepicker table) {
        margin: 0.75rem 0;
    }

    :deep(.p-datepicker table td) {
        padding: 0.75rem;
    }

    :deep(.p-datepicker table td > span) {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    :deep(.p-datepicker .p-datepicker-header) {
        padding: 0.75rem;
        margin-bottom: 0.75rem;
    }

    :deep(.p-datepicker table td.p-datepicker-today > span) {
        background-color: #e3f2fd;
        color: #2196f3;
        font-weight: bold;
    }

    :deep(.p-datepicker table td > span:hover) {
        background-color: #f5f5f5;
    }

    :deep(.p-datepicker table td.p-highlight > span) {
        background-color: #2196f3;
        color: #ffffff;
    }
</style>
