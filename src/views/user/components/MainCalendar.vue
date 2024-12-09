<template>
    <div v-if="isLoaded">
        <FullCalendar :options="calendarOptions" />
    </div>
    <div v-else>
        Loading...
    </div>
    
    <Dialog class="dialog" modal
        v-model:visible="isvisibleToday"
        :header="`${formatDateToKorean(todayList[0].start)} 시작 일정`"
        :style="{ width: '25rem' }"
    >
        <div v-for="schedule in todayList">
            {{ schedule.title }}
            {{ schedule.allDay ? '종일' : formatTime(schedule.start )}}
        </div>
    </Dialog>

</template>


<script setup>
import { ref, onMounted } from 'vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/vue3';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const isvisibleToday = ref(false);
const authStore = useAuthStore();
const events = ref([]);
const dayMap = ref(new Map());
const isLoaded = ref(false); // 로딩 상태 관리
const todayList = ref([{start:null}]);


const formatTime = (dateString) => {
    const date = new Date(dateString); // 문자열을 Date 객체로 변환

    let hours = date.getHours(); // 시 (24시간 형식)
    hours = hours-9 >0 ? hours-9 : hours + 15;
    const minutes = String(date.getMinutes()).padStart(2, '0'); // 분 (두 자리)

    const period = hours >= 12 ? '오후' : '오전'; // 오전/오후 구분
    hours = hours % 12 || 12; // 12시간 형식으로 변환 (0시 -> 12시)

    return `${period} ${hours}:${minutes}`;
};


const formatDateToKorean = (dateString) => {
    const date = new Date(dateString); // 문자열을 Date 객체로 변환

    // 월과 일을 두 자리로 가져오기
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();

    return `${month}월 ${day}일`;
};

// 스케줄 데이터를 가져오고 `dayMap` 업데이트
const fetchSchedules = async () => {
    try {
        const response = await axios.get(`/schedule/my?userId=${authStore.user.userId}`);
        const data = response.data.data;
        events.value = data.map(schedule => ({
            id: schedule.schedule_id,
            title: schedule.title || '(제목 없음)',
            content: schedule.content,
            start: new Date(new Date(schedule.start_time).getTime() + 9 * 60 * 60 * 1000), // UTC+09 변환
            end: new Date(new Date(schedule.end_time).getTime() + 9 * 60 * 60 * 1000), // UTC+09 변환
            allDay: new Date(schedule.start_time).getHours() === 0 && new Date(schedule.start_time).getMinutes() === 0? true: false,
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
                const intensity = Math.min(todayEvents.length / 5, 1); // 최대 5단계 기준
                let color;

                if (intensity === 1 / 5) {
                    color = "#bfbfbf "; // 연핑크
                } else if (intensity === 2 / 5) {
                    color = "#808080 "; // 핑크
                } else if (intensity === 3 / 5) {
                    color = "#404040 "; // 연주황
                } else if (intensity === 4 / 5) {
                    color = "#202020";   // 주황
                } else if (intensity === 1) {
                    color = "#000000";     // 빨강
                }

                // 배경색 설정
                dayNumber.style.backgroundColor = color;

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
                    isvisibleToday.value = true;
                    // todayEvents 배열을 start 값 기준으로 내림차순 정렬
                    todayList.value = [...todayEvents].sort((a, b) => new Date(a.start) -  new Date(b.start));
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
