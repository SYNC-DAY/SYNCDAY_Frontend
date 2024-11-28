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
            <!-- 시작 시간 선택 -->
            <div>
                <label for="startTime">시작 시간:</label>
                <input
                    id="startTime"
                    type="datetime-local"
                    :value="start"
                    @input="updateStartTime($event.target.value)"
                />
            </div>

            <!-- 종료 시간 선택 -->
            <div>
                <label for="endTime">종료 시간:</label>
                <input
                    id="endTime"
                    type="datetime-local"
                    :value="end"
                    @input="updateEndTime($event.target.value)"
                />
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
import utc from 'dayjs/plugin/utc';  // UTC 플러그인
import timezone from 'dayjs/plugin/timezone';  // 타임존 플러그인
import axios from 'axios';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

dayjs.extend(utc);  // UTC 플러그인 사용
dayjs.extend(timezone);  // 타임존 플러그인 사용

const authStore = useAuthStore();

const router = useRouter();

const props = defineProps({
    selectedInfo: {
        type: Object,
        required: true,
    },
});

console.log('모달로 넘어온 값:', props.selectedInfo);

// 시작과 종료 날짜 및 시간 받자!
const start = ref(props.selectedInfo.start);
const end = ref(props.selectedInfo.end);

console.log('start', start);
console.log('end', end);

// 종일 체크 여부
const isAllDay = ref();

// 날짜만 비교하여 isAllDay 설정
const updateIsAllDay = () => {
    // 오늘의 일정을 받을 때 여기서 end를 한시간 추가하게 할 수 있을 듯?

    // const startDate = new Date(start.value).toISOString().split('T')[0];
    // const endDate = new Date(end.value).toISOString().split('T')[0];

    // start와 end를 날짜만 비교하려면 시간 부분을 00:00로 설정하여 비교
    const startDate = new Date(start.value).setHours(0, 0, 0, 0);
    const endDate = new Date(end.value).setHours(0, 0, 0, 0);
    isAllDay.value = startDate !== endDate; // 날짜가 다르면 true, 같으면 false
};

// 'start'와 'end' 값이 변경될 때마다 updateIsAllDay 실행되게!
watch([start, end], updateIsAllDay, { immediate: true });

console.log('isAllDay:', isAllDay);

// 시작 날짜와 시간 포맷팅
const startDate = dayjs(start.value).tz('Asia/Seoul').format('YYYY-MM-DD');
const startDateTime = dayjs(start.value).tz('Asia/Seoul').format('HH:mm');
const endDate = dayjs(end.value).tz('Asia/Seoul').format('YYYY-MM-DD');
const endDateTime = dayjs(end.value).tz('Asia/Seoul').format('HH:mm');

console.log('startDate:', startDate);
console.log('startDateTime:', startDateTime);
console.log('endDate:', endDate);
console.log('endDateTime:', endDateTime);

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
    startTime: `${startDate}T${startDateTime}+09:00`,
    endTime: `${endDate}T${endDateTime}+09:00`,
    publicStatus: 'PRIVATE',
    scheduleRepeatId: null,
    repeatOrder: null,
    meetingStatus: 'INACTIVE',
    meetingRoomId: null,
    attendeeIds: [],
    notificationTime: null,
});

// 상태 변경을 formData에 반영
watch(isMeeting, (newValue) => {
    formData.value.meetingStatus = newValue ? 'ACTIVE' : 'INACTIVE';
}, { immediate: true });

watch(isPublic, (newValue) => {
    formData.value.publicStatus = newValue ? 'PUBLIC' : 'PRIVATE';
}, { immediate: true });

console.log('startTime:', formData.value.startTime);
console.log('endTime:', formData.value.endTime);

onMounted(() => {
    updateIsAllDay();
});

// const componentInstance = ref(null);

// onMounted(() => {
//     console.log(componentInstance.value); // 컴포넌트 인스턴스 확인
//     if (componentInstance.value && typeof componentInstance.value.update === 'function') {
//         componentInstance.value.update();
//     }
// });
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
