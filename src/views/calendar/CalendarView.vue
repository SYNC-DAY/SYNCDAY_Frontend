<template>
    <div class="app-container">
        <div class="calendar-container">
            <FullCalendar :options="calendarOptions" />
            <CalendarViewModal
                v-if="showEventModal"
                :schedule="selectedEvent"
                @close="closeModal"
                @submit="fetchSchedules"
            />
            <CalendarModal
                v-if="isModalVisible"
                :schedule="selectedInfo"
                @close="closeModal"
                @submit="fetchSchedules"
            />
            <Dialog v-model:visible="visible" :style="{ width: '25rem' }" position="top" header="직원 일정 검색" @hide="resetSearchData">
                <!-- 직원 검색 input -->
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText type="text" v-model="searchMember" placeholder="Search" @input="searchUsers" />
                </IconField>
                <!-- 검색 결과 목록 -->
                <div v-if="searchResults.length > 0" class="search-results">
                    <div v-for="user in searchResults" :key="user.userId" @click="addMemberSchedule(user)">
                        {{ user.teamName }} {{ user.name }}
                    </div>
                </div>
                <!-- 선택된 참석자 목록 -->
                <div class="selected-participants">
                    <div
                        v-for="participant in displayedParticipants"
                        :key="participant.userId"
                        class="participant-chip"
                        :style="{ backgroundColor: participant.color }"
                    >
                        {{ participant.name }}
                        <span class="remove-participant" @click="removeMemberSchedule(participant)">x</span>
                    </div>

                    <!-- 더보기 버튼 -->
                    <div
                        v-if="selectedParticipants.length > 5"
                        class="more-participants"
                        @click="showAllParticipants = !showAllParticipants"
                    >
                        {{ showAllParticipants ? '접기' : `+ ${selectedParticipants.length - 5}명 더 보기` }}
                    </div>
                </div>
            </Dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid'; // DayGrid 보기 플러그인
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // 클릭/드래그 기능
import CalendarViewModal from './component/CalendarViewModal.vue';
import CalendarModal from './component/CalendarModal.vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // UTC 플러그인
import timezone from 'dayjs/plugin/timezone'; // 타임존 플러그인
import 'dayjs/locale/ko';

import { useAuthStore } from '@/stores/auth';
import { shade } from '@primevue/themes';
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

const eventsMember = ref([]);

const visible = ref(false);

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    fixedWeekCount: false,
    height: '100%', // 캘린더 높이를 부모 컨테이너에 맞춤
    headerToolbar: {
        left: 'today prev next title',
        right: 'searchMemberSchedule dayGridMonth timeGridWeek addEventButton',
    },
    buttonText: {
        today: '오늘',
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
        searchMemberSchedule: {
            text: '직원 일정 검색',
            click: () => {
                visible.value = true;
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
        if (info.event.extendedProps.meetingStatus === 'ACTIVE') {
            alert('회의 중인 일정은 수정할 수 없습니다.');
            // FullCalendar의 드래그 동작을 원래 위치로 되돌리기
            info.revert();
            return;
        }
        await updateSchedule(info);
    },
    eventResize: async (info) => {
        if (info.event.extendedProps.meetingStatus === 'ACTIVE') {
            alert('회의 중인 일정은 수정할 수 없습니다.');
            // FullCalendar의 리사이즈 동작을 원래 위치로 되돌리기
            info.revert();
            return;
        }
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
                    meetingStatus: schedule.meeting_status,
                    username: schedule.username,
                    status: schedule.status,
                    attendeeIds: schedule.attendee_ids,
                    publicStatus: schedule.public_status,
                    sortEvents: authStore.user.userId,
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
    console.log('이동 하자 ㅠㅠ', info.event);
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

    try {
        console.log('PS', info.event.extendedProps);
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
                attendee_ids: info.event.extendedProps.attendeeIds.map((p) => p.user_id) || [],
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('스케줄 변경 성공:', response.data);
    } catch (error) {
        console.error('스케줄 변경 실패:', error.response?.data || error.message);
        alert('스케줄 변경에 실패했습니다. 다시 시도해주세요.');
    }
};

// 검색 키워드
const searchMember = ref('');

// 검색 결과
const searchResults = ref([]);

// 선택된 직원 목록
const selectedParticipants = ref([]);

const showAllParticipants = ref(false);

// 표시할 참석자 계산
const displayedParticipants = computed(() => {
    return showAllParticipants.value ? selectedParticipants.value : selectedParticipants.value.slice(0, 5);
});

// 사용자 검색 함수
const searchUsers = async () => {
    try {
        const sanitizedKeyword = searchMember.value.trim();
        if (!sanitizedKeyword) {
            searchResults.value = [];
            return;
        }

        const response = await axios.get(`/user/search`, {
            params: { keyword: sanitizedKeyword },
        });

        if (response.data.data) {
            // 본인과 이미 선택된 참석자 제외
            console.log('response', response.data.data);
            const currentUserId = authStore.user.userId;
            searchResults.value = response.data.data.filter(
                (user) =>
                    user.userId !== currentUserId && // 본인 제외
                    user.name.includes(sanitizedKeyword) &&
                    !selectedParticipants.value.some((p) => p.userId === user.userId)
            );
        } else {
            searchResults.value = [];
        }
    } catch (error) {
        console.error('Error fetching search results:', error);
        searchResults.value = [];
    }
};

// 랜덤 색상
// const generateRandomColor = () => {
//     const letters = '0123456789ABCDEF';
//     let color = '#';
//     for (let i = 0; i < 6; i++) {
//         color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
// };

const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360); // 색상: 0~360도 (모든 색상 포함)
    const saturation = Math.floor(Math.random() * 50) + 50; // 채도: 50% ~ 100% (밝고 선명한 색상)
    const lightness = Math.floor(Math.random() * 40) + 30; // 명도: 30% ~ 70% (너무 어둡거나 밝지 않은 색상)
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// 멤버 일정 조회
const addMemberSchedule = async (user) => {
    const color = generateRandomColor();

    // 중복 체크
    if (!selectedParticipants.value.some((p) => p.userId === user.userId)) {
        selectedParticipants.value.push({
            ...user,
            color,
        });
    }

    // 검색 초기화
    searchMember.value = '';
    searchResults.value = [];

    try {
        const response = await axios.get(`/schedule/others?searchUserId=${user.userId}`);
        let data = response.data.data;

        data = data.map((schedule) => {
            const startDate = new Date(schedule.start_time); // new Date()를 사용하면 KST로 바뀐다?
            const endDate = new Date(schedule.end_time);

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
            return {
                id: schedule.schedule_id,
                title: 'BUSY',
                start: startDate,
                end: endDate,
                allDay: isAllDay,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    sortEvents: user.userId,
                },
            };
        });
        events.value.push(...data);
        // searchMember.value = `${teamName} ${userName}`;
        // searchResults.value = [];

        console.log('Fetched Events:', events.value);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }
};

// 직원 검색 제거
const removeMemberSchedule = (user) => {
    selectedParticipants.value = selectedParticipants.value.filter((p) => p.userId !== user.userId);
    // 참석자 제거 후 5개 이하면 더보기 숨기기
    if (selectedParticipants.value.length <= 5) {
        showAllParticipants.value = false;
    };

    // events 배열에서 extendedProps.sortEvents가 user.userId인 이벤트 제거
    events.value = events.value.filter((event) => event.extendedProps.sortEvents !== user.userId);
};

// 검색 데이터를 초기화하는 함수
const resetSearchData = async () => {
    searchMember.value = '';
    searchResults.value = [];
    selectedParticipants.value = [];
    // eventsMember.value = [];
    await fetchSchedules();
};

onMounted(async () => {
    await fetchSchedules();
});
</script>

<style scoped>
/* html,
body,
#app {
    height: 100%;
    margin: 0;
    padding: 0;
}

/* 전체 레이아웃 */
.app-container {
    display: flex;
    height: 100vh; /* 화면 전체 높이 */
    width: 100vw; /* 화면 전체 너비 */
    overflow: hidden;
    position: relative;
}

/* 캘린더 영역 */
.calendar-container {
    flex: 1; /* 남은 공간을 캘린더가 차지 */
    height: 100vh; /* 화면 높이 */
    display: flex;
    flex-direction: column;
    padding: 1rem; /* 상하좌우 여백 */
    box-sizing: border-box; /* 패딩 포함한 크기 계산 */
    overflow: hidden;
    background-color: #fff;
}

.p-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-height: 800rem;
}

/* 직원 검색 결과 목록 스타일 */
.search-results {
    position: absolute;
    top: 7rem; /* InputText 아래에 위치하도록 설정 (필요에 따라 조정 가능) */
    left: 2rem;
    /* width: 10rem; */
    max-height: 200px; /* 최대 높이 설정 */
    overflow-y: auto; /* 결과가 많을 경우 스크롤 */
    background-color: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
    margin-top: 0.3rem; /* 입력 필드와 결과 사이의 여백 */
    padding: 0.1rem;
}

/* 검색 결과 항목 스타일 */
.search-results div {
    padding: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.search-results div:hover {
    background-color: #f0f0f0;
}

::v-deep(div .fc-toolbar-chunk) {
    display: flex;
}

::v-deep(.fc .fc-toolbar .fc-header-toolbar) {
    margin-bottom: 1rem;
}

::v-deep(.fc-direction-ltr .fc-toolbar > * > :not(:first-child)) {
    margin-left: 2rem;
}

::v-deep(.fc-toolbar-title) {
    display: inline-block;
    font-size: 2.5rem;
    margin-top: 0.3rem;
}

::v-deep(.fc-toolbar-chunk) {
    display: flex;
    align-items: center;
}

::v-deep(.fc-button-primary) {
    /* border: 1px solid #FF9D85 !important; */
    background-color: white;
    color: black;
    border: none;
    font-size: 1.2rem;
}

::v-deep(.fc-dayGridMonth-button.fc-button.fc-button-primary) {
    /* border: 1px solid #FF9D85 !important; */
    background-color: white;
    color: black;
    border: none;
    font-size: 1.2rem;
}

::v-deep(.fc-timeGridWeek-button.fc-button.fc-button-primary) {
    /* border: 1px solid #FF9D85 !important; */
    background-color: white;
    color: black;
    border: none;
    font-size: 1.2rem;
}

::v-deep(.fc-today-button.fc-button) {
    /* border: 1px solid #FF9D85 !important; */
    color: #000000;
    background-color: white;
    padding: 0.2rem 0.6rem !important;
    border-radius: 4px;
    margin-top: 0.2rem;
}

::v-deep(.fc-button:hover) {
    background-color: #ff9d85 !important;
    color: inherit !important;
}
::v-deep(.fc-button.fc-button-active) {
    border: none !important;
}

::v-deep(.fc .fc-button-primary:disabled) {
    background-color: white;
    border-color: #333;
}
::v-deep(.fc-button.fc-button-disabled) {
    cursor: not-allowed;
}

.selected-participants {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    position: relative;
    margin-top: 0.5rem;
}

.participant-chip {
    /* background-color: #e0e0e0; */
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    display: flex;
    align-items: center;
}

.remove-participant {
    margin-left: 5px;
    cursor: pointer;
    color: rgb(255, 255, 255);
}

.more-participants {
    cursor: pointer;
    margin-left: 10px;
    align-self: center;
}
</style>
