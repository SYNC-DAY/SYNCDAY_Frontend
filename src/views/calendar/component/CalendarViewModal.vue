<template>
    <div class="modal-container" @click="handleOutsideClick">
        <div class="modal-content">
            <div class="modal-header">
                <span class="pi pi-pencil" @click="openEditModal"></span>
                <span class="pi pi-trash" @click="deleteSchedule(scheduleId)"></span>
                <span class="pi pi-times" @click="$emit('close')"></span>
            </div>
            <CalendarModal
                v-if="isEditModalOpen"
                :schedule="schedule"
                :isEditMode="true"
                @close="$emit('close')"
                @submit="$emit('submit')"
            />
            <div class="modal-schedule">
                <!-- 제목 및 날짜 -->
                <div>
                    <div class="text">
                        <span
                            class="square"
                            :style="{
                                backgroundColor: backgroundColor,
                                border: border,
                                borderRadius: '4px',
                            }"
                        ></span>
                        <span class="title">
                            {{ title }}
                        </span>
                    </div>
                    <div class="date">
                        {{ formattedDate }}
                    </div>
                    <div></div>
                </div>

                <!-- 내용 -->
                <div class="text" v-if="content">
                    <span class="pi pi-align-left"></span>
                    <span class="detail-content">
                        {{ content }}
                    </span>
                </div>

                <!-- 공개 여부 -->
                <div class="text">
                    <span class="pi pi-exclamation-circle"></span>
                    <span class="detail-content">
                        {{ publicStatus == 'PUBLIC' ? '공개' : '비공개' }}
                    </span>
                </div>

                <!-- 회의 여부 -->
                <div class="text" v-if="meetingStatus === 'ACTIVE'">
                    <span class="pi pi-users"></span>
                    <span class="detail-content">
                        {{ meetingStatus == 'ACTIVE' ? '회의' : null }}
                    </span>
                </div>

                <!-- 회의실 있으면 회의랑 같이 보여주기 -->

                <!-- 주최자 -->
                <div class="text">
                    <span class="pi pi-calendar"></span>
                    <span class="detail-content">
                        {{ ownerUsername }}
                    </span>
                </div>

                <!-- 알람 (없으면 여기서 추가할 수 있게) -->
                <!-- isAllDay가 true면 알람추가 안되게 해야한다!!!!!!!!! -->
                <div class="text" v-if="!isAllDay">
                    <span class="pi pi-bell"></span>
                    <span v-if="notificationMessage && showSelectAlarm == false" class="detail-content">
                        {{ notificationMessage }}
                    </span>
                    <span
                        v-if="showSelectAlarm == false"
                        class="pi pi-spin pi-refresh"
                        style="margin-left: 1rem"
                        @click="showSelectAlarm = !showSelectAlarm"
                    ></span>
                    <span
                        v-if="!notificationMessage && showSelectAlarm == false"
                        class="detail-content"
                        style="cursor: pointer"
                        @click="showSelectAlarm = !showSelectAlarm"
                    >
                        알람 추가
                    </span>
                    <div v-if="showSelectAlarm" class="dropdown-container">
                        <Select
                            v-model="notificationTime"
                            :options="alarmOptions"
                            option-label="label"
                            option-value="value"
                            size="large"
                        ></Select>
                        <span class="pi pi-check" @click="updateSelectAlarm"></span>
                        <span class="pi pi-times" @click="showSelectAlarm = false"></span>
                    </div>
                </div>

                <!-- 참석과 불참 명단 -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineProps, watch } from 'vue';
import CalendarModal from './CalendarModal.vue';
import Select from 'primevue/select';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // UTC 플러그인
import timezone from 'dayjs/plugin/timezone'; // 타임존 플러그인
import duration from 'dayjs/plugin/duration';
import 'dayjs/locale/ko';
import axios from 'axios';

import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

dayjs.extend(utc); // UTC 플러그인 사용
dayjs.extend(timezone); // 타임존 플러그인 사용
dayjs.extend(duration);
dayjs.locale('ko');

const props = defineProps({
    schedule: {
        type: Object,
        required: true,
    },
});

// props로 받는 값!
const schedule = props.schedule;
console.log('schedule!!!', schedule);

const scheduleId = props.schedule.scheduleId;
const title = props.schedule.title;
const content = props.schedule.content;
const startTime = props.schedule.startTime;
const endTime = props.schedule.endTime;
// const updateTime = props.schedule.updateTime;
const publicStatus = props.schedule.publicStatus;
const meetingStatus = props.schedule.meetingStatus;
// const meetingroomId = props.schedule.meetingroomId;
// const ownerUserId = props.schedule.ownerUserId;
const ownerUsername = props.schedule.ownerUsername;
const userInfo = props.schedule.userInfo; // 이걸로 참석자 확인!!
// const myNotificationTime = ref(props.schedule.myNotificationTime);
const myNotificationTime = props.schedule.myNotificationTime;

const emit = defineEmits(['close', 'submit']);

const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
        emit('close');
    }
};

const isEditModalOpen = ref(false);

const openEditModal = () => {
    isEditModalOpen.value = true;
    // emit('close');
};

// 종일 체크 여부
const isAllDay = ref(dayjs(startTime).format('HH:mm') === '00:00' && dayjs(endTime).format('HH:mm') === '00:00');

// 현재 연도
const currentYear = dayjs().year();

const formattedDate = computed(() => formatDate(startTime, endTime, isAllDay.value));

// 날짜 포맷팅 함수
function formatDate(startTime, endTime, isAllDay) {
    const start = dayjs(startTime);
    const end = dayjs(endTime);

    // Helper: 요일 포맷
    const getWeekday = (date) => `(${dayjs(date).format('dddd')})`;

    // 1. `isAllDay`인 경우
    if (isAllDay) {
        // 1-1. 하루 차이인 경우
        if (start.isBefore(end, 'day') && start.add(1, 'day').isSame(end, 'day')) {
            return start.year() === currentYear
                ? `${start.format('MM월 DD일')} ${getWeekday(start)}`
                : `${start.format('YYYY년 M월 DD일')} ${getWeekday(start)}`;
        }

        // 1-2. 이틀 이상 차이인 경우
        const startFormatted =
            start.year() === currentYear ? `${start.format('MM월 DD일')}` : `${start.format('YYYY년 MM월 DD일')}`;
        const endAdjusted = end.subtract(1, 'day');
        const endFormatted =
            endAdjusted.year() === currentYear
                ? endAdjusted.month() === start.month()
                    ? `${endAdjusted.format('DD일')}`
                    : `${endAdjusted.format('MM월 DD일')}`
                : `${endAdjusted.format('YYYY년 MM월 DD일')}`;

        return `${startFormatted} - ${endFormatted}`;
    }

    // 2. `isAllDay`가 아닌 경우
    if (!isAllDay) {
        // 2-1. 같은 날
        if (start.isSame(end, 'day')) {
            const startPeriod = start.format('A'); // 오전/오후
            const endPeriod = end.format('A');
            const showEndPeriod = startPeriod !== endPeriod; // 시간대가 다르면 표시

            const timeRange = showEndPeriod
                ? `${start.format('A hh:mm')} - ${end.format('A hh:mm')}`
                : `${start.format('A hh:mm')} - ${end.format('hh:mm')}`;

            return start.year() === currentYear
                ? `${start.format('MM월 DD일')} ${getWeekday(start)} • ${timeRange}`
                : `${start.format('YYYY년 M월 DD일')} ${getWeekday(start)} • ${timeRange}`;
        }

        // 2-2. 다른 날
        return `${start.format('YYYY년 M월 DD일')}, ${start.format('A hh:mm')} - ${end.format(
            'YYYY년 M월 DD일'
        )}, ${end.format('A hh:mm')}`;
    }

    return '';
}

const backgroundColor = ref('');
const border = ref('');

// 현재 사용자와 일치하는 참석자 찾기
const currentUser = userInfo.find((user) => user.userId === authStore.user.userId);

console.log('현재 사용자', currentUser);

// 상태에 따른 색상 설정
if (currentUser) {
    const participationStatus = currentUser.participationStatus;

    if (participationStatus === 'ATTEND') {
        if (meetingStatus === 'ACTIVE') {
            backgroundColor.value = '#FE5D86';
            border.value = '2px solid #FE5D86';
        } else {
            backgroundColor.value = '#FF9D85';
            border.value = '2px solid #FF9D85';
        }
    } else if (participationStatus === 'PENDING') {
        if (meetingStatus === 'ACTIVE') {
            backgroundColor.value = 'white';
            border.value = '2px solid #FE5D86';
        } else {
            backgroundColor.value = 'white';
            border.value = '2px solid #FF9D85';
        }
    } else {
        backgroundColor.value = 'white';
        border.value = '2px solid #646464';
    }
}

const startTimeAdj = dayjs(startTime);

// notificationTime이 null이 아닌 경우, startTime과 계산하여 몇 분 전을 표시
const notificationMessage = ref('');

if (myNotificationTime) {
    const notificationTimeDiff = startTimeAdj.diff(dayjs(myNotificationTime), 'minute');
    notificationMessage.value = `${Math.abs(notificationTimeDiff)}분 전`; // 분 차이를 계산
} else {
    notificationMessage.value = ''; // null일 경우 비워두기
}

const showSelectAlarm = ref(false);

// 알람 시간 옵션 배열
const alarmOptions = [
    { label: '10분 전', value: '00:10' },
    { label: '20분 전', value: '00:20' },
    { label: '30분 전', value: '00:30' },
    { label: '40분 전', value: '00:40' },
    { label: '50분 전', value: '00:50' },
    { label: '1시간 전', value: '00:60' },
];

const notificationTime = ref(
    myNotificationTime
        ? String(((dayjs(startTime).diff(dayjs(myNotificationTime)) % 60000) / 1000 / 60) * 60).padStart(2, '0') +
              ':' +
              String(Math.floor(dayjs(startTime).diff(dayjs(myNotificationTime)) / 1000 / 60)).padStart(2, '0')
        : '00:10'
);

watch(
    notificationTime,
    () => {
        if (showSelectAlarm.value) {
            // "HH:mm" 형식의 시간을 duration으로 변환
            const [hours, minutes] = notificationTime.value.split(':').map(Number);
            const notificationDuration = dayjs.duration({ hours, minutes }); // duration 객체 생성

            // 기존 시작 시간 계산
            const originalStartTime = dayjs(
                `${dayjs(startTime).format('YYYY-MM-DD')}T${dayjs(startTime).format('HH:mm')}`
            );
            const adjustedTime = originalStartTime.subtract(notificationDuration); // 알람 시간만큼 빼기

            myNotificationTime.value = adjustedTime.format('YYYY-MM-DDTHH:mm:ss+09:00'); // ISO 형식으로 설정
            console.log(`알람 시간 설정!!: ${myNotificationTime.value}`);
        }
    },
    { immediate: true }
);

// 알람 수정
const updateSelectAlarm = async () => {
    try {
        const response = await axios.put(
            `/userschedule/notification`,
            {
                schedule_id: scheduleId,
                user_id: authStore.user.userId,
                notification_time: myNotificationTime.value,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        if (response.status === 200) {
            // 성공적으로 데이터를 전송한 후
            console.log(props.isEditMode ? '알람 수정 성공' : '알람 등록 성공', response.data);
        } else {
            // 서버에서 에러 발생 시
            alert('일정을 저장하는 데 실패했습니다. 다시 시도해주세요.');
        }

        emit('submit');
        emit('close');
    } catch (error) {
        console.error(
            props.isEditMode ? '스케줄 수정 실패' : '스케줄 등록 실패',
            error.response?.data || error.message
        );
        alert(props.isEditMode ? '스케줄 수정에 실패했습니다.' : '스케줄 등록에 실패했습니다. 다시 시도해주세요.');
    }
};

// 삭제 메소드
const deleteSchedule = async (scheduleId) => {
    try {
        // DELETE 요청 보내기
        const response = await axios.delete(`/schedule/${scheduleId}`);
        console.log('삭제 성공:', response.data);

        emit('close');
        emit('submit');

        // 성공 알림 (선택 사항)
        alert('스케줄이 삭제되었습니다.');
    } catch (error) {
        console.error('삭제 실패:', error.response?.data || error.message);

        // 실패 알림
        alert('스케줄 삭제에 실패했습니다. 다시 시도해주세요.');
    }
};
</script>

<style scoped>
.modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 80%;
    max-width: 450px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
}

.modal-header {
    display: flex;
    justify-content: flex-end;
    gap: 2rem;
}

.modal-header .pi {
    font-size: 1.5rem;
    cursor: pointer;
}

.modal-schedule {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    margin-top: 3rem;
    margin-left: 1rem;
}

.modal-schedule .square {
    display: inline-block;
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 1.5rem;
}

.modal-schedule .pi {
    font-size: 1.5rem;
    margin-right: 1.5rem;
}

.modal-schedule .date {
    margin-top: 1rem;
    margin-left: 3.5rem;
}

.modal-schedule .title {
    font-size: 1.7rem;
}

.modal-schedule .text {
    display: flex;
    align-items: center;
}

.modal-schedule .text .detail-content {
    font-size: 1.2rem;
}

.dropdown-container {
    display: flex;
    align-items: center;
    /* gap: 0.5rem; */
    position: relative;
}

.dropdown-container .pi {
    font-size: 1rem;
    color: #999;
    cursor: pointer;
    opacity: 0; /* 기본적으로 숨김 */
    transition: opacity 0.3s;
}

.dropdown-container:hover .pi {
    opacity: 1; /* 마우스가 드롭다운 위에 있을 때 표시 */
    color: #333;
}

.dropdown-container .pi-check {
    margin-left: 1rem;
}

.pi-spin {
    font-size: 1rem;
    color: #999;
    cursor: pointer;
    opacity: 0; /* 기본적으로 숨김 */
    transition: opacity 0.3s;
}

.pi-spin:hover {
    opacity: 1; /* 마우스가 드롭다운 위에 있을 때 표시 */
    color: #333;
}
</style>
