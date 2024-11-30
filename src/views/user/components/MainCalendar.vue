<template>
    <div v-if="isLoaded">
        <FullCalendar :options="calendarOptions" />
    </div>
    <div v-else>
        Loading...
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';
import axios from 'axios';

const events = ref([]);
const dayMap = ref(new Map());
const isLoaded = ref(false); // 로딩 상태 관리

// 스케줄 데이터를 가져오고 `dayMap` 업데이트
const fetchSchedules = async () => {
    try {
        const response = await axios.get(`/schedule/my?userId=1`);
        const data = response.data.data;
        console.log(data)
        events.value = data.map(schedule => ({
            id: schedule.schedule_id,
            title: schedule.title || '(제목 없음)',
            content: schedule.content,
            start: new Date(new Date(schedule.start_time).getTime() + 9 * 60 * 60 * 1000), // UTC+09 변환
            end: new Date(new Date(schedule.end_time).getTime() + 9 * 60 * 60 * 1000), // UTC+09 변환
            allDay: false,
            backgroundColor: '#FF9D85',
            borderColor: '#FF9D85',
        }));

        dayMap.value = new Map();
        events.value.forEach(event => {
            const dateKey = new Date(event.start).toISOString().split('T')[0];
            if (!dayMap.value.has(dateKey)) {
                dayMap.value.set(dateKey, []);
            }
            dayMap.value.get(dateKey).push(event);
        });

        isLoaded.value = true; // 로딩 완료
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
};

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    height: 'auto', // 셀 높이를 자동으로 설정
    locale: 'ko',
    fixedWeekCount: true, // 모든 달이 고정된 6주를 표시
    datesSet: async () => {
        await fetchSchedules();
    },
    dayCellContent: info => `${info.date.getDate()}`, // 날짜 표시
    dayCellDidMount: info => {
        const year = info.date.getFullYear();
        const month = String(info.date.getMonth() + 1).padStart(2, '0');
        const day = String(info.date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        const todayEvents = dayMap.value.get(dateKey) || [];

        const dayNumber = info.el.querySelector('.fc-daygrid-day-number');
        if (dayNumber) {
            dayNumber.style.display = 'flex';
            dayNumber.style.justifyContent = 'center';
            dayNumber.style.alignItems = 'center';
            dayNumber.style.borderRadius = '50%';
            dayNumber.style.width = '30px';
            dayNumber.style.height = '30px';

            if (todayEvents.length > 0) {
                const intensity = Math.min(todayEvents.length / 10, 1); // 최대 10개 이벤트 기준
                const red = 255; // 빨강값 유지
                const green = Math.max(150 - Math.round(intensity * 200), 0); // 초록값을 더 낮은 범위로 설정
                const blue = Math.max(50 - Math.round(intensity * 150), 0); // 파랑값도 낮춰 강렬하게

                dayNumber.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
                dayNumber.style.color = 'white';

                // 마우스 오버 스타일 추가
                info.el.style.cursor = 'pointer';
                info.el.addEventListener('mouseenter', () => {
                    dayNumber.style.transform = 'scale(1.1)'; // 크기 증가
                    dayNumber.style.transition = 'transform 0.2s'; // 부드러운 전환
                });
                info.el.addEventListener('mouseleave', () => {
                    dayNumber.style.transform = 'scale(1)'; // 원래 크기로 복구
                });

                // 클릭 이벤트 추가
                info.el.addEventListener('click', () => {
                    const eventDetails = todayEvents
                        .map(event => `Title: ${event.title}\n Content: ${event.content} \n Time: ${new Date(event.start).toISOString()} - ${event.end.toLocaleString()}`)
                        .join('\n\n');
                    alert(`Events on ${dateKey}:\n\n${eventDetails}`);
                });
            } else {
                dayNumber.style.backgroundColor = 'transparent';
                info.el.style.cursor = 'default'; // 클릭 불가능한 느낌
            }
        }
    },
});
onMounted(async () => {
    await fetchSchedules();
});
</script>

<style scoped>
/* 기본 셀 스타일 */
::v-deep(.fc-daygrid-day-frame) {
  display: flex; /* Flexbox 활성화 */
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
}

::v-deep(.fc-daygrid-day-number) {
  display: flex; /* Flexbox 활성화 */
  justify-content: center; /* 수평 중앙 정렬 */
  align-items: center; /* 수직 중앙 정렬 */
  border-radius: 50%; /* 동그라미 모양 */
  width: 30px; /* 크기 지정 */
  height: 30px; /* 크기 지정 */
  font-weight: bold; /* 텍스트 강조 */
  transition: transform 0.2s; /* 부드러운 전환 효과 */
}

</style>
