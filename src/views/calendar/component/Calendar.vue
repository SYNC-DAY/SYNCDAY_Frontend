<template>
    <div class="card p-4">
        <h1 class="text-3xl font-bold mb-4">일정 관리</h1>
        <div class="calendar-container">
            <Calendar v-model="selectedDate" :inline="true" showWeek :locale="locale" selectionMode="single" class="w-full" @date-select="onDateSelect" />
        </div>
    </div>
</template>

<script setup>
    import Calendar from 'primevue/calendar';
    import { ref } from 'vue';

    // 선택된 날짜 상태 관리
    const selectedDate = ref(new Date());

    // 한국어 로케일 설정
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

    // 날짜 선택 이벤트 핸들러
    const onDateSelect = (value) => {
        console.log('Selected date:', value);
    };
</script>

<style scoped>
    .calendar-container {
        max-width: 100%;
        margin: 0 auto;
    }

    :deep(.p-datepicker) {
        width: 100%;
        min-width: 100%;
        padding: 0.5rem;
    }

    :deep(.p-datepicker table) {
        margin: 0.5rem 0;
    }

    :deep(.p-datepicker table td) {
        padding: 0.5rem;
    }

    :deep(.p-datepicker table td > span) {
        width: 2.5rem;
        height: 2.5rem;
    }

    :deep(.p-datepicker .p-datepicker-header) {
        padding: 0.5rem;
        margin-bottom: 0.5rem;
    }
</style>
