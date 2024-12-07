<template>
    <div v-if="isAssistantVisible" class="assistant-container">
    <div class="assistant-balloon">
        <div class="tab-button-container">
            <button :class="{ active: tab === 'today' }" @click="selectTab('today')">
                오늘의 일정
            </button>
            <button :class="{ active: tab === 'notified' }" @click="selectTab('notice')">
                일정 알림
            </button>
        </div>
        <div v-if="tab == 'today'" class="today-schedule">
            <p>반갑습니다! Syncday 비서 문어입니다.</p>
            <p>오늘의 일정을 안내드립니다.</p>
            <div class="today-schedule-container">
                <table class="today-schedule-table">
                    <thead>
                        <tr>
                            <th>제목</th>
                            <th>시작</th>
                            <th>알림여부</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(schedule, index) in todaySchedules" :key="index" :class="{'past-schedule': isPastSchedule(schedule.start_time)}">
                            <td>{{ schedule.title }}</td>
                            <td>{{ formatStart(schedule.start_time) }}</td>
                            <template v-if="isPastSchedule(schedule.start_time)">
                                <td>이미 시작된 일정입니다.</td>
                            </template>
                            <template v-else>
                                <td class="edit-td" v-if="editingSchedule === schedule.schedule_id">
                                    <div class="dropdown-menu">
                                        <select v-model="selectedNotificationTimes[schedule.schedule_id]" class="dropdown-select">
                                            <option disabled value="">시간 선택</option>
                                            <option v-for="time in notificationTimes" :key="time" :value="time">
                                                {{ time }}분 전
                                            </option>
                                            <option value="cancle">알림 취소</option>
                                        </select>
                                    </div>
                                    <div v-if="editingSchedule === schedule.schedule_id">
                                        <button @click="saveNotificationTime(schedule)">확인</button>
                                        <button @click="cancelEditing()">취소</button>
                                    </div>
                                </td>

                                <template v-else>
                                    <td>
                                        {{ schedule.notification_time ? formatStart(schedule.notification_time) : '알림 없음' }}
                                        <button @click="editNotification(schedule.schedule_id)">수정</button>
                                    </td>
                                </template>
                            </template>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-if="tab == 'notice'" class="notice-schedule">
            <p>안녕하세요.</p>
            <div v-if="notiedSchedules.length >0 ">
                <p>다음 일정이 곧 시작됩니다.</p>
                <table class="notice-schedule-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Start Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(schedule, index) in notiedSchedules" :key="index">
                            <td>{{ schedule.title }}</td>
                            <td>{{ formatStart(schedule.start_time) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p>아직 알림드릴 일정이 없습니다.</p>
            </div>
        </div>
        <button @click="hide">닫기</button>
    </div>
    <div class="assistant-avatar">
        <img src="@/assets/images/assistant.png" alt="Assistant" />
    </div>
    </div>
    <div v-else class="assistant-button-container" @click="show">
    <img  alt="누르면 비서가 나오는 이미지" />
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed,watch } from 'vue';
import { useAssistantStore } from '@/stores/assistant';
import { useAuthStore } from '@/stores/auth';
import { EventSourcePolyfill } from 'event-source-polyfill';
import axios from 'axios';

const assistantStore = useAssistantStore();
const authStore = useAuthStore();
const isAssistantVisible = ref(false);
const notificationTimes = [10,20,30,40,50,60];
const selectedNotificationTimes = ref({});
const editingSchedule = ref(null); 



const todaySchedules = computed(() => assistantStore.todaySchedules);
const notiedSchedules = computed(() => assistantStore.notiedSchedules);

const tab = ref("today");

const isPastSchedule = (start_time) => {
    const startTime = new Date(start_time);
    const now = new Date();
    return startTime < now;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';

    hours = hours % 12;
    hours = hours ? hours : 12; 

    return `${year}-${month}-${day} ${ampm} ${String(hours).padStart(2, '0')}:${minutes}`;
};


const formatStart = (dateString) => {
    const date = new Date(dateString);


    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';

    hours = hours % 12;
    hours = hours ? hours : 12; 

    if (hours == 12 && ampm == '오전' ) {
        return "자정";
    }

    return `${ampm} ${String(hours).padStart(2, '0')}:${minutes}`;
};


const editNotification = (scheduleId) => {
    editingSchedule.value = scheduleId; // 수정 모드로 전환
    selectedNotificationTimes.value[scheduleId] = ""; // 초기화
};

const cancelEditing = () => {
    editingSchedule.value = null; // 수정 모드 취소
};

const saveNotificationTime = async (schedule) => {
    const selectedTime = selectedNotificationTimes.value[schedule.schedule_id];

    if (!selectedTime) {
        alert("알림 시간을 선택해주세요.");
        return;
    }

    if (selectedTime === 'cancle'){
        try{        
            await axios.put(`/userschedule/notification`, {
            notification_time: null,
            schedule_id: schedule.schedule_id,
            user_id: authStore.user.userId
        });

        // 업데이트 후 상태 변경
        schedule.notification_time = null;
        editingSchedule.value = null;
        } catch{
            console.error("Failed to set notification time:", error);
        }
    }

    try {
        const minutesBefore = selectedTime;
        const notificationTime = new Date(new Date(schedule.start_time) - minutesBefore * 60000);

        await axios.put(`/userschedule/notification`, {
            notification_time: notificationTime.toISOString(),
            schedule_id: schedule.schedule_id,
            user_id: authStore.user.userId
        });

        // 업데이트 후 상태 변경
        schedule.notification_time = notificationTime.toISOString();
        editingSchedule.value = null;
    } catch (error) {
        console.error("Failed to set notification time:", error);
    }
};


const selectTab = (selectedTab) => {
    tab.value = selectedTab;
}
const hide = () => {
    isAssistantVisible.value = false;
};
const show = () => {
    isAssistantVisible.value = true;
};


const eventSource = ref(null);

const connect = (userId, token) => {
if (eventSource.value) {
    console.log("SSE already connected");
    return;
}

eventSource.value = new EventSourcePolyfill(
    // `http://localhost:8080/sse/notification/subscribe/${authStore.user.userId}`,
    `http://localhost:5000/sse/notification/subscribe/1`,
    {
    headers: {
        Authorization: `Bearer ${token}`,
        
    },
    connectionTimeout: 24*60*60*1000, 
    heartbeatTimeout: 24*60*60*1000, 
    }
);

eventSource.value.onmessage = (event) => {
    console.log("Received event:", event.data);
    assistantStore.getNotiedSchedule(JSON.parse(event.data));
    tab.value = "notice";
    isAssistantVisible.value = true;
};

const MAX_RETRY = 5;
let retryCount = 0;
let isConnecting = false;

eventSource.value.onerror = (error) => {
    console.error("SSE connection error:", error);
    disconnect();

    if (retryCount >= MAX_RETRY) {
        console.error("Max retry attempts reached. Stopping reconnection.");
        return;
    }

    if (isConnecting) return; // 중복 방지
    isConnecting = true;

    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000);
    console.log(`Reconnecting in ${retryDelay / 1000} seconds...`);

    setTimeout(() => {
        connect(userId, token);
        retryCount++;
        isConnecting = false;
    }, retryDelay);
};

};

const disconnect = () => {
if (eventSource.value) {
    eventSource.value.close();
    eventSource.value = null;
    console.log("SSE disconnected");
}
};


onMounted(()=>{
    const userId = authStore.user.userId;
    const token = authStore.accessToken;

    if(assistantStore.isFirst){
        assistantStore.initialize(userId);
        isAssistantVisible.value = true;
    }
    assistantStore.getTodaySchedule(userId);

    connect(userId,token);
})
onUnmounted(()=>{
    disconnect();
})
</script>

<style scoped>

.assistant-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 1;
}

/* 비서 아바타 */
.assistant-avatar {
    width: 7rem;
    height: 7rem;
    border-radius: 50%;
    overflow: hidden;
}

.assistant-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 말풍선 스타일 */
.assistant-balloon {
    position: relative;
    margin-top: 0.5rem;
    background-color: #ffffff;
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 0.2rem 0.6rem rgba(0, 0, 0, 0.2);
    max-width: 50rem;
    max-height: 30rem;
    text-align: left;
    font-size: 14px;
    color: #333333;
    border: 1px solid #ddd;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
}


/* 닫기 버튼 */
.assistant-balloon button {
    margin-top: 8px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.assistant-balloon button:hover {
    background-color: #0056b3;
}

/* 비서 버튼 컨테이너 */
.assistant-button-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    z-index: 1;
}

.assistant-button-container img {
    width: 40px;
    height: 40px;
    object-fit: contain;
}
.today-schedule-table {
    width: 100%;
    border-collapse: separate; /* 기본 테이블 간격 유지 */
    border-spacing: 1rem; /* 요소 간 간격을 1rem으로 설정 */
}



.today-schedule-table th {
    background-color: #f4f4f4;
    font-weight: bold;
}



.today-schedule-table tr.past-schedule {
    color: grey;
}

.edit-td{
    
}




</style>
