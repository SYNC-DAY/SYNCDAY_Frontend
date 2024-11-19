<template>
    <div style="height: 100%; width: 100%">
        <FullCalendar :options="calendarOptions" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid'; // DayGrid 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 클릭/드래그 기능

import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();
// const user = ref({});
// const loading = ref(true);

// 이벤트 데이터
const events = ref([]);

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'title prev next today',
        right: 'dayGridMonth,timeGridWeek',
    },
    views: {
        dayGridMonth: {
            buttonText: '월간',
        },
        timeGridWeek: {
            buttonText: '주간',
        },
    },
    selectable: true, // 드래그로 날짜 선택 가능
    editable: true, // 이벤트 편집 가능 (드래그 앤 드롭 활성화)
    droppable: true, // 이벤트 드래그 앤 드롭 활성화
    locale: 'ko',
    dateClick: (info) => {
        alert(`Date clicked: ${info.dateStr}`);
    },
    select: (info) => {
        alert(`Selected from ${info.startStr} to ${info.endStr}`);
    },
    events: events,
});

// GET으로 조회!!!
const fetchSchedules = async () => {
    try {
        const response = await axios.get(`/schedule/my?userId=${authStore.user.userId}`);
        console.log(response);
        const data = response.data.data;
        console.log(data);

        events.value = data.map((schedule) => {
            const startDate = new Date(schedule.start_time);
            const endDate = new Date(schedule.end_time);

            // 날짜가 같으면 시간까지 포함
            const isSameDate = startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0];

            // 날짜가 다르면 endDate에 1일 추가
            if (!isSameDate) {
                endDate.setDate(endDate.getDate() + 1); // 날짜가 다르면 1일 추가
            }

            return {
                id: schedule.schedule_id,
                title: schedule.title,
                // 날짜가 같으면 시간까지 포함하고, 다르면 날짜만 표시
                start: isSameDate ? startDate.toISOString() : startDate.toISOString().split('T')[0],
                end: isSameDate ? endDate.toISOString() : endDate.toISOString().split('T')[0],
                backgroundColor: '#FF9D85',
                borderColor: '#FF9D85',
                extendedProps: {
                    content: schedule.content,
                    // 필요하면 더 추가
                },
            };
        });

        console.log('Fetched Events:', events.value);
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
};

onMounted(async () => {
    await fetchSchedules();
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
