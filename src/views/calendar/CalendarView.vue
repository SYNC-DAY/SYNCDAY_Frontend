<template>
    <div style="height: 100%; width: 100%">
        <FullCalendar :options="calendarOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid'; // DayGrid 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 클릭/드래그 기능

import { useAuthStore } from '@/stores/auth';
const user = ref({})
const authStore = useAuthStore()
const loading = ref(true)

console.log(user);

// 이벤트 데이터
const events = ref([
    { title: 'Event 1', start: '2024-11-20', end: '2024-11-22' },
    { title: 'Event 2', start: '2024-11-25' },
]);

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    selectable: true, // 드래그로 날짜 선택 가능
    editable: true, // 이벤트 편집 가능 (드래그 앤 드롭 활성화)
    droppable: true, // 이벤트 드래그 앤 드롭 활성화
    dateClick: (info) => {
        alert(`Date clicked: ${info.dateStr}`);
    },
    select: (info) => {
        alert(`Selected from ${info.startStr} to ${info.endStr}`);
    },
    events: events,
});

onMounted(async () => {
    try {
        // authStore.isAuthenticated가 true라면 이미 profile 데이터가 있는 상태
        if (authStore.isAuthenticated) {
            const response = await axios.get('/user/profile');
            user.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
html,
body,
#app {
    height: 100%;
    margin: 0;
    padding: 0;
}

div {
    height: 100%; /* 캘린더 컨테이너에 높이 100% 설정 */
    width: 100%; /* 캘린더 컨테이너에 너비 100% 설정 */
}
</style>
