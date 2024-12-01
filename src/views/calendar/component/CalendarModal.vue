<template>
    <div class="modal-container">
        <div class="modal-content">
            <!-- 닫기 버튼 -->
            <button class="close-btn" @click="$emit('close')">×</button>

            <!-- 제목 -->
            <div>
                <input v-model="formData.title" class="title-input" placeholder="제목을 입력해주세요." />
            </div>

            <!-- 날짜/시간 -->
            <div>
                <div>
                    <span>시작 : </span>
                    <span>{{ startDateView }}</span>
                    <span v-if="isAllDay == false"> {{ startDateTimeView }} </span>
                </div>
                <div>
                    <span>종료 : </span>
                    <span>{{ endDateView }}</span>
                    <span v-if="isAllDay == false"> {{ endDateTimeView }} </span>
                </div>
            </div>

            <!-- 종일 체크 -->
            <div class="flex items-center mb-4">
                <label>
                    <input type="checkbox" v-model="isAllDay" class="mr-2" />
                    종일
                </label>
            </div>

            <!-- 내용 -->
            <div>
                <textarea v-model="formData.content" placeholder="내용을 입력해주세요."></textarea>
            </div>

            <!-- 회의 토글 -->
            <div class="toggle-section">
                <div class="toggle-item">
                    <div class="toggle-label">
                        <img src="@/assets/images/meeting.svg" alt="meeting" class="icon" />
                        <span>회의</span>
                    </div>
                    <div class="toggle-switch" :class="{ active: isMeeting }" @click="toggleMeeting">
                        <div class="toggle-slider"></div>
                    </div>
                </div>
            </div>

            <!-- 회의실 -->
            <div v-if="isMeeting">
                <div>
                    <!-- 회의실 조회해서 회의실 id 가져오게 해야한다. 이때 시간을 넘겨서 조회 -->
                    <span>회의실 추가</span>
                </div>
            </div>

            <!-- 공개 토글 -->
            <div class="toggle-section">
                <div class="toggle-item">
                    <div class="toggle-label">
                        <img src="@/assets/images/alert.svg" alt="alert" class="icon" />
                        <span>공개</span>
                    </div>
                    <div class="toggle-switch" :class="{ active: isPublic }" @click="togglePublic">
                        <div class="toggle-slider"></div>
                    </div>
                    <span class="toggle-description"> 공개는 타인이 본인의 일정을 검색 시 보여지게 됩니다. </span>
                </div>
            </div>

            <!-- 참석자 -->
            <div>
                <div>
                    <img src="@/assets/images/attendee.svg" alt="attendee" />
                    <span> 참석자 </span>
                </div>
                <div>
                    <!-- 엘라스틱 서치로 user_id를 리스트에 넣는다. -->
                    <span>추가</span>
                </div>
            </div>

            <!-- 알람 -->
            <!-- 시간에 대한 알람만 있다면 종일이 풀려서 시간이 보일 때 나타나게 해도 괜찮을 듯! -->
            <div>
                <div>
                    <img src="@/assets/images/alarm-clock.svg" alt="alarm-clock" />
                    <span>알람</span>
                </div>
                <div>
                    <span>추가</span>
                </div>
            </div>

            <div>{{ dayjs(formData.startTime).format('YYYY-MM-DDTHH:mm') }}</div>
            <div>{{ dayjs(formData.endTime).format('YYYY-MM-DDTHH:mm') }}</div>

            <br /><br />

            <!-- 버튼 영역 -->
            <div class="button-section">
                <button class="cancel-btn" @click="$emit('close')">취소</button>
                <button class="submit-btn" @click="submitSchedule">저장</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; // UTC 플러그인
import timezone from 'dayjs/plugin/timezone'; // 타임존 플러그인
import 'dayjs/locale/ko';
import axios from 'axios';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

dayjs.extend(utc); // UTC 플러그인 사용
dayjs.extend(timezone); // 타임존 플러그인 사용
dayjs.locale('ko');

const authStore = useAuthStore();

const router = useRouter();

const props = defineProps({
    selectedInfo: {
        type: Object,
        required: true,
    },
});

console.log('모달로 넘어온 값:', props.selectedInfo);

// 캘린더에서 받은 날짜
const start = ref(props.selectedInfo.start);
const end = ref(props.selectedInfo.end);

// 종일 체크 여부 -> 날짜냐? 날짜+시간이냐? 차이!!!!!!
const isAllDay = ref('');

// DatePicker와 v-binding 및 template에 포맷팅하여 보여줄 변수
// 날짜 (YYYY-MM-DD)
// 시간 (HH:mm)
const startDate = ref('');
const startDateTime = ref('');
const endDate = ref('');
const endDateTime = ref('');

// template에 보여줄 변수
// 날짜 (MM월 DD일 (dddd))
// 시간 (오전 or 오후 HH:mm)
const startDateView = ref();
const startDateTimeView = ref();
const endDateView = ref();
const endDateTimeView = ref();

// DB에 저장할 변수
// 날짜 (YYYY-MM-DD)
// 시간 (HH:mm)
const startDateRegist = ref('');
const startDateTimeRegist = ref('');
const endDateRegist = ref('');
const endDateTimeRegist = ref('');

// 시간 포맷 함수 (오전/오후 HH:mm) -> template에 보여줄 때 사용!
function formatTime(date) {
    const hour = dayjs(date).hour();
    const minute = dayjs(date).minute();
    const period = hour < 12 ? '오전' : '오후';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // 12시간제로 변환
    const formattedMinute = minute.toString().padStart(2, '0'); // 분을 2자리로
    return `${period} ${formattedHour}:${formattedMinute}`;
}

// isAllDay가 true일 때 처리
function handleAllDayTrue() {
    startDateTime.value = '00:00';
    endDateTime.value = '00:00';

    startDateTimeRegist.value = '00:00';
    endDateTimeRegist.value = '00:00';

    // View 변수 업데이트
    startDateTimeView.value = '오전 00:00';
    endDateTimeView.value = '오전 00:00';

    // endDateRegist를 하루 더하기
    const currentEndDate = new Date(endDateRegist.value); // 기존 종료 날짜 가져오기
    currentEndDate.setDate(currentEndDate.getDate() + 1); // 하루 더하기
    endDateRegist.value = currentEndDate.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환

    // View 변수 업데이트
    endDateView.value = dayjs(endDate.value).format('MM월 DD일 (dddd)');

    updateFormData();
}

// isAllDay가 false일 때 처리
function handleAllDayFalse() {
    const now = dayjs(); // 현재 시간
    const nextHour = now.add(1, 'hour').startOf('hour'); // 다음 정시
    const twoHoursLater = nextHour.add(1, 'hour'); // 다다음 정시

    startDateTime.value = nextHour.format('HH:mm');
    endDateTime.value = twoHoursLater.format('HH:mm');

    // View 변수 업데이트
    startDateTimeView.value = formatTimeView(nextHour);
    endDateTimeView.value = formatTimeView(twoHoursLater);

    startDateTimeRegist.value = nextHour.format('HH:mm');
    endDateTimeRegist.value = twoHoursLater.format('HH:mm');

    // endDateRegist 값을 하루 전으로 설정
    endDateRegist.value = dayjs(endDateRegist.value).subtract(1, 'day').format('YYYY-MM-DD');

    // View 변수 업데이트
    endDateView.value = dayjs(endDate.value).format('MM월 DD일 (dddd)');

    updateFormData();
}

// formData 업데이트
function updateFormData() {
    formData.value.startTime = `${startDateRegist.value}T${startDateTimeRegist.value}+09:00`;
    formData.value.endTime = `${endDateRegist.value}T${endDateTimeRegist.value}+09:00`;
}

// // 날짜와 시간 포맷팅 함수
// function formatDateView(date) {
//     return dayjs(date).format('MM월 DD일 (dddd)');
// }

function formatTimeView(time) {
    const timeObj = dayjs(time, 'HH:mm');
    const meridiem = timeObj.hour() < 12 ? '오전' : '오후';
    const formattedHour = timeObj.hour() % 12 || 12; // 12시간제로 표시
    return `${meridiem} ${String(formattedHour).padStart(2, '0')}:${timeObj.format('mm')}`;
}

// 초기값 설정!!
const formatDateTime = (start, end, isAllDay) => {
    if (isAllDay) {
        // 종일: 날짜는 `YYYY-MM-DD`, 시간은 00:00
        startDate.value = dayjs(start).format('YYYY-MM-DD');
        endDate.value = dayjs(end).subtract(1, 'day').format('YYYY-MM-DD'); // 하루 빼기
        // 시간은 캘린더와 다르게 작성!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        startDateTime.value = '00:00';
        endDateTime.value = '00:00';

        // View 변수 업데이트
        startDateView.value = dayjs(start).format('MM월 DD일 (dddd)');
        endDateView.value = dayjs(end).subtract(1, 'day').format('MM월 DD일 (dddd)');
        startDateTimeView.value = '오전 00:00';
        endDateTimeView.value = '오전 00:00';

        // Regist 변수에 담기 (하루를 더해서 endDate 담기)
        startDateRegist.value = dayjs(start).format('YYYY-MM-DD');
        startDateTimeRegist.value = '00:00';
        endDateRegist.value = dayjs(end).format('YYYY-MM-DD');
        endDateTimeRegist.value = '00:00';

        // 처음 formData에 저장
        updateFormData();
    } else {
        // 날짜 + 시간: 날짜는 `YYYY-MM-DD`, 시간은 오전/오후 HH:mm
        startDate.value = dayjs(start).format('YYYY-MM-DD');
        endDate.value = dayjs(end).format('YYYY-MM-DD');
        startDateTime.value = dayjs(start).format('HH:mm');
        endDateTime.value = dayjs(end).format('HH:mm');

        // View 변수 업데이트
        startDateView.value = dayjs(start).format('MM월 DD일 (dddd)');
        endDateView.value = dayjs(end).format('MM월 DD일 (dddd)');
        startDateTimeView.value = formatTimeView(start);
        endDateTimeView.value = formatTimeView(end);

        // Regist 변수에 담기 (그대로 담기)
        startDateRegist.value = dayjs(start).format('YYYY-MM-DD');
        startDateTimeRegist.value = dayjs(start).format('HH:mm');
        endDateRegist.value = dayjs(end).format('YYYY-MM-DD');
        endDateTimeRegist.value = dayjs(end).format('HH:mm');

        // 처음 formData에 저장
        updateFormData();
    }
};

// 회의 여부
const isMeeting = ref(false);

// 공개 여부
const isPublic = ref(false);

// 회의 토글 핸들러
const toggleMeeting = () => {
    isMeeting.value = !isMeeting.value;
    if (isMeeting.value) {
        isPublic.value = true; // 회의가 활성화되면 공개 상태도 활성화
    }
};

// 공개 토글 핸들러
const togglePublic = () => {
    if (!isMeeting.value) {
        isPublic.value = !isPublic.value; // 회의가 활성화되지 않은 경우에만 공개 상태를 변경
    }
};

const submitSchedule = async () => {
    try {
        // formData 변환
        const dataToSend = {
            user_id: formData.value.id,
            title: formData.value.title,
            content: formData.value.content,
            start_time: formData.value.startTime,
            end_time: formData.value.endTime,
            public_status: formData.value.publicStatus,
            schedule_repeat_id: formData.value.scheduleRepeatId,
            repeat_order: formData.value.repeatOrder,
            meeting_status: formData.value.meetingStatus,
            meetingroom_id: formData.value.meetingRoomId,
            attendee_ids: formData.value.attendeeIds,
            notification_time: formData.value.notificationTime,
        };

        // POST 요청 보내기
        const response = await axios.post('/schedule', dataToSend, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // 성공 시 처리
        console.log('스케줄 등록 성공:', response.data);

        // 부모 컴포넌트에 데이터 전달
        emit('submit', response.data);

        // 모달 닫기
        emit('close');
    } catch (error) {
        // 실패 시 에러 처리
        console.error('스케줄 등록 실패:', error.response?.data || error.message);

        // 사용자에게 에러 알림
        alert('스케줄 등록에 실패했습니다. 다시 시도해주세요.');
    }
};

const emit = defineEmits(['close', 'submit']);

const formData = ref({
    id: authStore.user.userId,
    title: null,
    content: null,
    startTime: `${startDateRegist.value}T${startDateTimeRegist.value}+09:00`,
    endTime: `${endDateRegist.value}T${endDateTimeRegist.value}+09:00`,
    publicStatus: 'PRIVATE',
    scheduleRepeatId: null,
    repeatOrder: null,
    meetingStatus: 'INACTIVE',
    meetingRoomId: null,
    attendeeIds: [],
    notificationTime: null,
});

// 상태 변경을 formData에 반영
watch(
    isMeeting,
    (newValue) => {
        formData.value.meetingStatus = newValue ? 'ACTIVE' : 'INACTIVE';
    },
    { immediate: true }
);

watch(
    isPublic,
    (newValue) => {
        formData.value.publicStatus = newValue ? 'PUBLIC' : 'PRIVATE';
    },
    { immediate: true }
);

onMounted(() => {
    isAllDay.value = 
        dayjs(start.value).format('HH:mm') === '00:00' && 
        dayjs(end.value).format('HH:mm') === '00:00';

    // 함수 호출
    formatDateTime(start.value, end.value, isAllDay.value);

    console.log('SR:', formData.value.startTime);
    console.log('ER:', formData.value.endTime);

    console.log('startDate:', startDate.value);
    console.log('startDateTime:', startDateTime.value);
    console.log('endDate:', endDate.value);
    console.log('endDateTime:', endDateTime.value);

    // watch 설정
    watch(isAllDay, (newVal) => {
        if (newVal) {
            handleAllDayTrue();
        } else {
            handleAllDayFalse();
        }
        console.log('startDate?:', startDate.value);
        console.log('startDateTime?:', startDateTime.value);
        console.log('endDate?:', endDate.value);
        console.log('endDateTime?:', endDateTime.value);
        console.log('startDateView:', startDateView.value);
        console.log('startDateTimeView:', startDateTimeView.value);
        console.log('endDateView:', endDateView.value);
        console.log('endDateTimeView:', endDateTimeView.value);
    });
});
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
    background: white;
    width: 100%;
    max-width: 500px;
    border-radius: 12px;
    padding: 24px;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
}

.title-input {
    width: 100%;
    border: none;
    font-size: 20px;
    padding: 8px 0;
    margin-top: 16px;
    color: #333;
}

.title-input::placeholder {
    color: #999;
}

.date-button {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    font-size: 16px;
    padding: 0;
    display: inline-block;
}

.DatePicker {
    position: absolute;
    z-index: 9999 !important; /* 다른 요소들과 겹치지 않게 적절한 값으로 설정 */
}

.toggle-section {
    margin-bottom: 16px;
}

.toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.toggle-label {
    display: flex;
    align-items: center;
}

.toggle-label .icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
}

.toggle-switch {
    width: 40px;
    height: 20px;
    background-color: #ddd;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background-color 0.3s;
}

.toggle-switch.active {
    background-color: #4caf50;
}

.toggle-slider {
    width: 16px;
    height: 16px;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    transition: transform 0.3s;
}

.toggle-switch.active .toggle-slider {
    transform: translate(18px, -50%);
}

.toggle-description {
    margin-top: 8px;
    font-size: 0.875rem;
    color: #666;
}

.cancel-btn {
    padding: 10px 20px;
    border: 1px solid #e0e0e0;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    color: #666;
}

.submit-btn {
    padding: 10px 20px;
    background: #ff758c;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
</style>
