<template>
    <div class="modal-overlay" @click="handleOutsideClick">
        <div class="modal-content">
            <!-- 닫기 버튼 -->
            <div class="close-btn-wrapper">
                <button class="close-btn" @click="$emit('close')">×</button>
            </div>
            <h3>상세조회</h3>
            <div>scheduleId: {{ scheduleId }}</div>
            <div>title: {{ title }}</div>
            <div>content: {{ content }}</div>
            <div>startTime: {{ startTime }}</div>
            <div>endTime: {{ endTime }}</div>
            <div>updateTime: {{ updateTime }}</div>
            <div>publicStatus: {{ publicStatus }}</div>
            <div>scheduleRepeatId: {{ scheduleRepeatId }}</div>
            <div>repeatOrder: {{ repeatOrder }}</div>
            <div>meetingStatus: {{ meetingStatus }}</div>
            <div>meetingroomId: {{ meetingroomId }}</div>
            <div>userId: {{ userId }}</div>
            <div>username: {{ username }}</div>
            <div>userInfo: {{ userInfo }}</div>
            <div>allDay: {{ allDay }}</div>
            <button @click="$emit('close')">Close</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from 'vue';
import dayjs from 'dayjs';
import axios from 'axios';

const props = defineProps({
    schedule: {
        type: Object,
        required: true,
    },
});

const scheduleId = props.schedule.scheduleId;
const title = props.schedule.title;
const content = props.schedule.content;
const startTime = props.schedule.startTime;
const endTime = props.schedule.endTime;
const updateTime = props.schedule.updateTime;
const publicStatus = props.schedule.publicStatus;
const scheduleRepeatId = props.schedule.scheduleRepeatId;
const repeatOrder = props.schedule.repeatOrder;
const meetingStatus = props.schedule.meetingStatus;
const meetingroomId = props.schedule.meetingroomId;
const userId = props.schedule.userId;
const username = props.schedule.username;
const userInfo = props.schedule.userInfo;
const allDay = props.schedule.allDay;

// 종일 체크 여부
const isAllDay = ref(false);

const handleOutsideClick = (event) => {
    if (event.target === event.currentTarget) {
        emit('close');
    }
};

const emit = defineEmits();

onMounted(() => {});
</script>

<style scoped>
/* CalendarViewModal.vue 스타일 */
/* .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    background-color: white;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
} */
.close-btn-wrapper {
    position: absolute;
    top: 10px;
    right: 10px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #aaa;
    transition: color 0.2s;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    position: relative;
    background: white;
    padding: 3rem;
    border-radius: 1rem;
    width: 300px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
