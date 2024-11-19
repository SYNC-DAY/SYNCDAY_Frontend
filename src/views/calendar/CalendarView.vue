<template>
    <div>
        <FullCalendar :options="calendarOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid'; // DayGrid 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 클릭/드래그 기능

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    selectable: true, // 드래그로 날짜 선택 가능
    dateClick: (info) => {
        alert(`Date clicked: ${info.dateStr}`);
    },
    select: (info) => {
        alert(`Selected from ${info.startStr} to ${info.endStr}`);
    },
    events: events,
    
});

// 이벤트 데이터
const events = ref([
    { title: 'Event 1', start: '2024-11-20', end: '2024-11-22' },
    { title: 'Event 2', start: '2024-11-25' },
]);

onMounted();
</script>

<style scoped></style>
