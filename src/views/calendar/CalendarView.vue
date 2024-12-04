<template>
    <div style="height: 100%; width: 100%">
        <FullCalendar :options="calendarOptions" />
        <CalendarViewModal
            v-if="showEventModal"
            :schedule="selectedEvent"
            @close="closeModal"
            @submit="fetchSchedules"
        />
        <CalendarModal v-if="isModalVisible" :schedule="selectedInfo" @close="closeModal" @submit="fetchSchedules" />
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid'; // DayGrid 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 클릭/드래그 기능
import CalendarViewModal from './component/CalendarViewModal.vue';
import CalendarModal from './component/CalendarModal.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // UTC 플러그인
import timezone from 'dayjs/plugin/timezone'; // 타임존 플러그인
import 'dayjs/locale/ko';

import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

dayjs.extend(utc); // UTC 플러그인 사용
dayjs.extend(timezone); // 타임존 플러그인 사용
dayjs.locale('ko');

// 조회 모달 관련
const showEventModal = ref(false);
const selectedEvent = ref({});

// 등록 모달 관련
const isModalVisible = ref(false);
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
    dayCellContent: (info) => {
        if (info.view.type == 'dayGridMonth') {
            return { html: `<div class='date-circle'>${info.date.getDate()}</div>` }; // 원하는 HTML 삽입
        }
    },
    customButtons: {
        addEventButton: {
            text: '일정 추가',
            click: () => {
                // 현재 날짜와 시간을 기준으로 시작 시간(start) 설정 (정시)
                const start = new Date();
                start.setMinutes(0); // 분을 0으로 설정
                start.setSeconds(0); // 초를 0으로 설정
                start.setMilliseconds(0); // 밀리초를 0으로 설정
                start.setHours(start.getHours() + 1); // 한 시간 뒤로 설정

                // 끝 시간(end)은 시작 시간의 한 시간 뒤
                const end = new Date(start);
                end.setHours(end.getHours() + 1); // 끝 시간을 시작 시간 +1시간으로 설정
                selectedInfo.value = {
                    start: start,
                    end: end,
                };
                isModalVisible.value = true;

                console.log('selectedInfo', selectedInfo.value);
            },
        },
    },
    selectable: true, // 드래그로 날짜 선택 가능
    editable: true, // 이벤트 편집 가능 (드래그 앤 드롭 활성화)
    droppable: true, // 이벤트 드래그 앤 드롭 활성화
    locale: 'ko',
    dateClick: (info) => {
        console.log('dateClick:', info);
        // selectedInfo.value = info;
        // isModalVisible.value = true; // 모달 열기
        // alert(`Date clicked: ${info.dateStr}`);
    },
    select: (info) => {
        selectedInfo.value = info;
        isModalVisible.value = true; // 모달 열기
        console.log('selectInfo 보자!', info);
        console.log('start???:', info.start);
        console.log('end???:', info.end);
    },
    eventClick: async (info) => {
        await fetchDetailSchedules(info.event.id, authStore.user.userId);

        // 클릭된 이벤트의 allDay 값을 추가로 설정
        selectedEvent.value = {
            ...selectedEvent.value, // 기존의 상세 데이터 유지
            // allDay: info.event.allDay, // allDay 속성 추가
        };
        console.log('selectedEvent:', selectedEvent.value);

        // 모달 열기
        showEventModal.value = true;
        console.log('showEventModal:', showEventModal.value);
    },
    eventDrop: async (info) => {
        console.log('이동할때', info);
        await updateSchedule(info);
    },
    eventResize: async (info) => {
        await updateSchedule(info);
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
        const data = response.data.data;

        events.value = data.map((schedule) => {
            const startDate = new Date(schedule.start_time); // new Date()를 사용하면 KST로 바뀐다?
            const endDate = new Date(schedule.end_time);

            const differenceTime = ref(null);

            if (schedule.notification_time) {
                const notificationTime = new Date(schedule.notification_time);

                // 시간 차이를 밀리초 단위로 계산
                differenceTime.value = startDate.getTime() - notificationTime.getTime();
            }

            // isAllDay를 True로 설정하는 조건
            let isAllDay = false;

            // startDate와 endDate의 시각이 모두 00:00인지 확인
            const isStartAtMidnight = startDate.getHours() === 0 && startDate.getMinutes() === 0;
            const isEndAtMidnight = endDate.getHours() === 0 && endDate.getMinutes() === 0;

            if (isStartAtMidnight && isEndAtMidnight) {
                // 둘 다 00:00일 경우 isAllDay를 true로 설정
                isAllDay = true;
            } else if (!isStartAtMidnight || !isEndAtMidnight) {
                // 시각이 하나라도 00:00이 아니고, 날짜가 다를 경우 isAllDay는 true
                if (startDate.toDateString() !== endDate.toDateString()) {
                    // 날짜가 다르면 endDate에 하루를 추가하고 시간을 00:00으로 설정
                    endDate.setDate(endDate.getDate() + 1);
                    endDate.setHours(0, 0, 0, 0);
                    isAllDay = true;
                }
            }

            const backgroundColor = ref('#FF9D85');
            const borderColor = ref('#FF9D85');
            const textColor = ref('white');

            if (schedule.status === 'ATTEND') {
                if (schedule.meeting_status === 'ACTIVE') {
                    backgroundColor.value = '#FE5D86';
                    borderColor.value = '#FE5D86';
                    textColor.value = 'white';
                } else {
                    backgroundColor.value = '#FF9D85';
                    borderColor.value = '#FF9D85';
                    textColor.value = 'white';
                }
            } else if (schedule.status === 'PENDING') {
                if (schedule.meeting_status === 'ACTIVE') {
                    backgroundColor.value = 'white';
                    borderColor.value = '#FE5D86';
                    textColor.value = 'black';
                } else {
                    backgroundColor.value = 'white';
                    borderColor.value = '#FF9D85';
                    textColor.value = 'black';
                }
            } else {
                backgroundColor.value = 'white';
                borderColor.value = '#646464';
                textColor.value = 'black';
            }

            return {
                id: schedule.schedule_id,
                title: schedule.title ? schedule.title : '(제목 없음)',
                start: startDate,
                end: endDate,
                allDay: isAllDay,
                backgroundColor: backgroundColor.value,
                borderColor: borderColor.value,
                textColor: textColor.value,
                extendedProps: {
                    content: schedule.content,
                    meetingStatus: schedule.meeting_status,
                    meetingroomId: schedule.meetingroom_id,
                    notificationTime: schedule.notification_time,
                    publicStatus: schedule.public_status,
                    status: schedule.status,
                    attendeeIds: schedule.attendee_ids.map((attendee) => attendee.user_id),
                    differenceTime: differenceTime.value,
                    // 필요하면 더 추가
                },
            };
        });
        console.log('오류잡자', events.value);

        console.log('Fetched Events:', events.value);
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
};

const fetchDetailSchedules = async (scheduleId, userId) => {
    try {
        const response = await axios.get(`/schedule/my/${scheduleId}?userId=${userId}`);
        const data = response.data.data[0];

        console.log('data!!:', data);

        if (!data) {
            console.error('No data found in the response');
            return;
        }

        console.log('data??', data);

        // selectedEvent를 가져온 데이터로 업데이트
        selectedEvent.value = {
            scheduleId: data.schedule_id,
            title: data.title,
            content: data.content,
            startTime: new Date(data.start_time),
            endTime: new Date(data.end_time),
            updateTime: new Date(data.update_time),
            publicStatus: data.public_status,
            meetingStatus: data.meeting_status,
            meetingroomId: data.meetingroom_id,
            ownerUserId: data.owner_user_id,
            ownerUsername: data.owner_username,
            myNotificationTime: data.my_notification_time ? new Date(data.my_notification_time) : null,
            userInfo:
                Array.isArray(data.user_info) && data.user_info.length > 0
                    ? data.user_info.map((user) => ({
                          userId: user.user_id, // 그대로 null도 허용
                          username: user.username, // 그대로 null도 허용
                          participationStatus: user.participation_status, // 그대로 null도 허용
                          notificationTime: user.notification_time, // 그대로 null도 허용
                      }))
                    : [], // user_info가 없으면 빈 배열로 처리
        };

        console.log('잘 들어갔나?', selectedEvent.value);
    } catch (error) {
        console.error('Error fetching schedules:', error);
    }
};

const updateSchedule = async (info) => {
    console.log('updateSche', info.event);

    // 종일일정 여부 확인
    const isAllDay = info.event.allDay; // FullCalendar에서 종일 일정 여부

    // 날짜 포맷 처리: 종일 일정일 경우 시간을 00:00으로 설정
    const startTime = isAllDay
        ? dayjs(info.event.start).tz('Asia/Seoul').startOf('day').format('YYYY-MM-DDTHH:mmZ') // KST로 변환
        : dayjs(info.event.start).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mmZ'); // KST로 변환

    const endTime = isAllDay
        ? info.event.end
            ? dayjs(info.event.end).tz('Asia/Seoul').startOf('day').format('YYYY-MM-DDTHH:mmZ')
            : dayjs(info.event.start).tz('Asia/Seoul').add(1, 'hour').startOf('day').format('YYYY-MM-DDTHH:mmZ')
        : info.event.end
        ? dayjs(info.event.end).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mmZ')
        : dayjs(info.event.start).tz('Asia/Seoul').add(1, 'hour').format('YYYY-MM-DDTHH:mmZ');

    // info.event.extendedProps.differenceTime이 null이 아닌지 확인
    const newNotificationTime = ref(null);
    if (info.event.extendedProps.differenceTime !== null) {
        // startTime을 Date 객체로 변환
        const startDate = new Date(info.event.start); // ISO 8601 형식

        // differenceTime을 밀리초로 사용하여 차이를 계산
        const formattedDate = new Date(startDate.getTime() - info.event.extendedProps.differenceTime);

        // dayjs로 변환하고 한국 시간대(KST)로 설정
        newNotificationTime.value = dayjs(formattedDate)
            .tz('Asia/Seoul') // 한국 시간대
            .format('YYYY-MM-DDTHH:mmZ'); // '2024-12-17T02:00+09:00' 형식

        console.log('변경 알람 시간', newNotificationTime.value); // 출력: 2024-12-17T02:00+09:00
    } else {
        console.log('변경 알람 시간', newNotificationTime.value);
    }

    try {
        const response = await axios.put(
            `/schedule/${info.event.id}`,
            {
                schedule_id: info.event.id,
                title: info.event.title,
                content: info.event.extendedProps.content,
                // 종일일정일 경우 startOf('day')를 사용해 시간 00:00으로 설정
                start_time: startTime,
                end_time: endTime,
                meeting_status: info.event.extendedProps.meetingStatus,
                meetingroom_id: info.event.extendedProps.meetingroomId,
                public_status: info.event.extendedProps.publicStatus,
                user_id: authStore.user.userId,
                attendee_ids: info.event.extendedProps.attendeeIds || [],

                // 이건 계산해서 넣자...
                // notification_time: info.event.notificationTime,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const responseNotification = await axios.put(
            `/userschedule/notification`, {
                schedule_id: info.event.id,
                user_id: authStore.user.userId,
                notification_time: newNotificationTime.value,
            },{
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        console.log('스케줄 변경 성공:', response.data);
    } catch (error) {
        console.error('스케줄 변경 실패:', error.response?.data || error.message);
        alert('스케줄 변경에 실패했습니다. 다시 시도해주세요.');
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
