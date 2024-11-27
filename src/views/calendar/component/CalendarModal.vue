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

            <!-- 종일 체크 -->
            <div class="flex items-center mb-4">
                <label>
                    <input type="checkbox" v-model="isAllDay" class="mr-2" />
                    종일
                </label>
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
import axios from 'axios';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { useAuthStore } from '@/stores/auth';
const authStore = useAuthStore();

const props = defineProps({
    selectedInfo: {
        type: Object,
        required: true,
    },
});

console.log('모달로 넘어온 값:',props.selectedInfo);

const formData = ref({
    id: authStore.user.userId,
    title: null,
    content: null,
    startTime: '2024-11-26',
    endTime: '2024-11-28',
    publicStatus: 'PRIVATE',
    scheduleRepeatId: null,
    repeatOrder: null,
    meetingStatus: 'INACTIVE',
    meetingRoomId: null,
    attendeeIds: [],
    notificationTime: null,
});

// 날짜 포맷팅
const formatDate = (date) => {
    const d = new Date(date);

    return new Intl.DateTimeFormat('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    }).format(d);
};

// 시간 포맷팅
const formatDateTime = (date) => {
    const d = new Date(date);

    return new Intl.DateTimeFormat('ko-KR', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // 12시간 형식 (오전/오후) 사용
    }).format(d);
};

// 시간 초기값, 기본값 포맷팅

// 시작 날짜 및 시간
const rawStartDate = ref(new Date());

// 종료 날짜 및 시간
const rawEndDate = ref(new Date());

// 종일 체크 여부
const isAllDay = ref(props.selectedInfo.allDay);
console.log('종일 여부 체크:',isAllDay);
console.log('시간 체크:',props.selectedInfo.start);

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

// 상태 변경을 formData에 반영
watch(isMeeting, (newValue) => {
    formData.value.meetingStatus = newValue ? 'ACTIVE' : 'INACTIVE';
});

watch(isPublic, (newValue) => {
    formData.value.publicStatus = newValue ? 'PUBLIC' : 'PRIVATE';
});

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

        // 모달 닫기
        emit('close');

        // CalendarView로 이동
        setTimeout(() => {
            router.push({ name: 'CalendarView' });
        }, 300); // 필요 시 딜레이 추가
    } catch (error) {
        // 실패 시 에러 처리
        console.error('스케줄 등록 실패:', error.response?.data || error.message);

        // 사용자에게 에러 알림
        alert('스케줄 등록에 실패했습니다. 다시 시도해주세요.');
    }
};

const emit = defineEmits(['close', 'submit']);
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
