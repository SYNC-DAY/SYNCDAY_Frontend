<template>
    <div style="height: 100%; width: 100%">
        <FullCalendar :options="calendarOptions" />
        <CalendarViewModal v-if="showEventModal" :schedule="selectedEvent" @close="closeModal" />
        <CalendarModal
            v-if="isModalVisible"
            :selectedInfo="selectedInfo"
            @close="closeModal"
            @submit="handleModalSubmit"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid'; // DayGrid 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 클릭/드래그 기능
import CalendarViewModal from './component/CalendarViewModal.vue';
import CalendarModal from './component/CalendarModal.vue';

import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

const showEventModal = ref(false);
const selectedEvent = ref({});

const isModalVisible = ref(false); // 모달 표시 상태
const selectedInfo = ref({});

// 이벤트 데이터
const events = ref([]);

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'title prev next today',
        right: 'dayGridMonth,timeGridWeek addEventButton',
    },
    views: {
        dayGridMonth: {
            buttonText: '월간',
        },
        timeGridWeek: {
            buttonText: '주간',
        },
    },
    customButtons: {
        addEventButton: {
            text: '일정 추가',
            click: (info) => {
                selectedInfo.value = info;
                isModalVisible.value = true;
            },
        },
    },
    selectable: true, // 드래그로 날짜 선택 가능
    editable: true, // 이벤트 편집 가능 (드래그 앤 드롭 활성화)
    droppable: true, // 이벤트 드래그 앤 드롭 활성화
    locale: 'ko',
    dateClick: (info) => {
        // selectedInfo.value = info;
        // isModalVisible.value = true; // 모달 열기
        // alert(`Date clicked: ${info.dateStr}`);
    },
    select: (info) => {
        selectedInfo.value = info;
        isModalVisible.value = true; // 모달 열기
        console.log('selectInfo 보자!', info);
        // alert(`Selected from ${info.startStr} to ${info.endStr}`);
    },
    eventClick: async (info) => {
        await fetchDetailSchedules(info.event.id, authStore.user.userId);
        console.log('selectedEvent:', selectedEvent.value);

        // 모달 열기
        showEventModal.value = true;
        console.log('showEventModal:', showEventModal.value);
    },
    events: events,
});

const closeModal = () => {
    if (isModalVisible.value == true) {
        isModalVisible.value = false;
    } else if (showEventModal.value == true) {
        showEventModal.value = false;
    }
};

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

            // 날짜 차이를 계산
            const dayDifference = 
                Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)); // 일 단위 차이 계산

            // 종일 이벤트인지 확인
            const isAllDay = 
                dayDifference > 1 || // 2일 이상 차이가 나는 경우
                (dayDifference === 1 && // 하루 차이면서
                    startDate.getHours() === 0 && 
                    startDate.getMinutes() === 0 && 
                    endDate.getHours() === 0 && 
                    endDate.getMinutes() === 0);

            return {
                id: schedule.schedule_id,
                title: schedule.title,
                start: startDate,
                end: endDate,
                allDay: isAllDay,
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

const fetchDetailSchedules = async (scheduleId, userId) => {
    try {
        const response = await axios.get(`/schedule/my/${scheduleId}?userId=${userId}`);
        const data = response.data.data[0];
        console.log('DetailSchedule!!:', data);

        // UTC 시간을 KST로 변환하는 함수
        const convertToKST = (utcTime) => {
            const utcDate = new Date(utcTime);
            const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // 9시간 추가
            return kstDate.toISOString().replace('Z', '+09:00');
        };

        // selectedEvent를 가져온 데이터로 업데이트
        selectedEvent.value = {
            scheduleId: data.schedule_id,
            title: data.title,
            content: data.content,
            startTime: convertToKST(data.start_time),
            endTime: convertToKST(data.end_time),
            updateTime: convertToKST(data.update_time),
            publicStatus: data.public_status,
            scheduleRepeatId: data.schedule_repeat_id,
            repeatOrder: data.repeat_order,
            meetingStatus: data.meeting_status,
            meetingroomId: data.meetingroom_id,
            userId: data.user_id,
            username: data.username,
            userInfo: data.user_info.map((user) => ({
                userId: user.user_id,
                username: user.username,
                participationStatus: user.participationStatus,
            })),
        };
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
};

onMounted(() => {
    fetchSchedules();
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
