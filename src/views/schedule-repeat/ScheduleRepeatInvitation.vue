<template>
    <div class="invitation-page">
    <h1>일정 초대 목록</h1>
    <table class="invitation-table">
        <thead>
        <tr>
            <th>일정명</th>
            <th>시작</th>
            <th>초대자</th>
            <th>참석 여부</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(schedule, index) in schedules" :key="index">
            <td>{{ schedule.name }}</td>
            <td>{{ formatDate(schedule.start) }} ~ {{ formatDate(schedule.end) }}</td>
            <td>
            <span class="inviter">
                {{ schedule.inviter }}
            </span>
            </td>
            <td>
            <button
                class="decline-button"
                :class="{ active: schedule.status === '불참' }"
                @click="handleResponse(schedule, '불참')"
            >
                불참
            </button>
            <button
                class="accept-button"
                :class="{ active: schedule.status === '참석' }"
                @click="handleResponse(schedule, '참석')"
            >
                참석
            </button>
            </td>
        </tr>
        </tbody>
    </table>
    </div>
</template>

<script setup>
import { ref } from "vue";

// Mock 데이터
const schedules = ref([
    {
    name: "SyncDay 기획회의",
    start: "2024-11-19T18:00:00",
    end: "2024-11-19T19:00:00",
    inviter: "김정모",
    status: "미정", // 현재 상태
    },
    {
    name: "SyncDay 기획회의",
    start: "2024-11-19T18:00:00",
    end: "2024-11-19T19:00:00",
    inviter: "김정모",
    status: "참석",
    },
    {
    name: "SyncDay 기획회의",
    start: "2024-11-19T18:00:00",
    end: "2024-11-19T19:00:00",
    inviter: "김정모",
    status: "불참",
    },
]);

// 날짜 포맷 함수
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    });
};

// 응답 처리 함수
const handleResponse = (schedule, status) => {
    schedule.status = status; // 상태 업데이트
};
</script>

<style scoped>


.invitation-page {
    text-align: center;
    padding: 1rem;
}

.invitation-table {
    margin: 2rem auto;
    border-collapse: collapse;
    width: 90%;
    font-size: 2.5rem;
}

.invitation-table th,
.invitation-table td {
    border: 0.1rem solid #ddd;
    padding: 1rem;
    text-align: center;
}

.invitation-table th {
    background-color: #f2f2f2;
}

.inviter {
    display: flex;
    align-items: center;
    justify-content: center;
}

.crown-icon {
    width: 1.6rem;
    height: 1.6rem;
    margin-right: 0.4rem;
}

button {
    border: none;
    padding: 0.6rem 1rem; /* 버튼 크기 (rem 단위) */
    margin-right: 0.4rem;
    cursor: pointer;
    font-size: 1rem; /* 글씨 크기 (기본 크기) */
    border-radius: 0.8rem; /* 둥글게 */
    background-color: #ccc; /* 기본 회색 */
    color: #000;
    transition: all 0.3s ease; /* 부드러운 전환 효과 */
    box-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.1); /* 살짝의 그림자 */
}

button.active {
    color: #000000; /* 활성화된 버튼의 텍스트 색상 */
    transform: scale(1.05); /* 클릭 시 살짝 커지도록 */
}

.decline-button.active {
    background-color: #F3889F; /* 불참 버튼 활성화 색상 */  
}

.accept-button.active {
    background-color: #88F3AF; /* 참석 버튼 활성화 색상 */
}

.pending-button.active {
    background-color: #88C4F3; /* 미정 버튼 활성화 색상 */
}

/* 반응형 크기 */
@media (max-width: 768px) {
button {
    font-size: 0.9rem; /* 작은 화면에서는 글씨 크기 줄임 */
    padding: 0.5rem 0.8rem; /* 버튼 크기 축소 */
}
}

@media (max-width: 480px) {
button {
    font-size: 0.8rem; /* 모바일 화면에서 글씨 더 줄임 */
    padding: 0.4rem 0.6rem; /* 버튼 크기 더 축소 */
    border-radius: 0.6rem; /* 둥근 정도 줄임 */
}
}

</style>
