<template>
    <div>
        <!-- 초대된 일정이 없을 경우 -->
        <div v-if="!invitationList.length" class="logo-container">
            <h2 class="logo-text">초대된 일정이 없습니다.</h2>
        </div>

        <!-- 초대된 일정이 있을 경우 -->
        <div v-else class="invitation-container">
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
                    <tr v-for="(invitation, index) in invitationList.slice(0,3)" :key="index">
                        <td>{{ invitation.title }}</td>
                        <td>{{ formatDateRange(invitation.start_time, invitation.end_time) }}</td>
                        <td>
                            <span>{{ invitation.schedule_owner_name }}</span><br>
                            <span>({{ invitation.team_name }})</span>
                        </td>
                        <td>
                            <button
                                :class="['status-button', { 'active': invitation.status === 'ATTEND' }, 'accept-button']"
                                @click="updateAttendance(invitation, 'ATTEND')">
                                참석
                            </button>
                            <button
                                :class="['status-button', { 'active': invitation.status === 'ABSENT' }, 'reject-button']"
                                @click="updateAttendance(invitation, 'ABSENT')">
                                불참
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <Button @click="goToinviation">더보기</Button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const invitationList = ref([]);

// 초대된 일정 가져오기
const getInvitationList = async () => {
    try {
        const response = await axios.get(`/userschedule/my?userId=${authStore.user.userId}`);
        const allList = response.data.data;
        const pendingList = allList.filter(invitation => invitation.participation_status === 'PENDING' 
                                            &&new Date(invitation.start_time) >= new Date());
        invitationList.value = pendingList;
    } catch (error) {
        console.error("Failed to fetch invitations:", error);
    }
};

// 날짜 및 시간 형식 포맷터
const formatDateRange = (start, end) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);

        const year = String(date.getFullYear()).slice(2); // 24 형식
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 두 자리 월
        const day = String(date.getDate()).padStart(2, '0'); // 두 자리 일

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0'); // 두 자리 분
        const ampm = hours >= 12 ? '오후' : '오전'; // 오전/오후 표시

        hours = hours % 12 || 12; // 12시간 형식 (0시 -> 12시)

        return `${year}.${month}.${day} ${ampm} ${String(hours).padStart(2, '0')}:${minutes}`;
    };

    return `${formatDate(start)} ~ ${formatDate(end)}`;
};

// 참석 여부 업데이트
const updateAttendance = async (invitation, status) => {
    try {
        await axios.put(`/userschedule/status`, {
            schedule_id: invitation.schedule_id,
            user_id: authStore.user.userId,
            participation_status: status,
        });
        invitation.status = status; // 상태 업데이트
    } catch (error) {
        console.error("Failed to update attendance:", error);
    }
};

const goToinviation = ()=>{
    router.push('/invitation/view');
};

onMounted(async () => {
    await getInvitationList();
});
</script>

<style scoped>
.invitation-container {
display: flex;
flex-direction: column;
gap: 1.5rem; /* 각 초대 항목 간 간격 */
width: 100%;
}

.invitation-table {
width: 100%;
border-collapse: separate;
border-spacing: 0; /* 테두리 간격 제거 */
font-size: 1.1rem;
border: 1px solid #ddd; /* 테두리 */
border-radius: 8px; /* 둥근 테두리 */
overflow: hidden; /* 내용물이 벗어나지 않게 */
}

.invitation-table td {
padding: 1rem; /* 셀 내부 여백 */
vertical-align: middle; /* 텍스트와 아이콘 정렬 */
font-size: 1rem;
color: #333; /* 기본 텍스트 색상 */
}

.invitation-table th {
display: none; /* 헤더를 제거 */
}

.invitation-table tr {
display: flex; /* 행을 flex로 처리 */
flex-direction: row; /* 각 항목을 가로로 배치 */
justify-content: space-between; /* 내용 간 간격 배치 */
align-items: center;
border-bottom: 1px solid #ddd; /* 행 간격 선 */
}

.invitation-table tr:last-child {
border-bottom: none; /* 마지막 행 테두리 제거 */
}

.icon {
margin-right: 0.5rem;
}

.status-button {
padding: 0.5rem 1rem;
border: none;
border-radius: 4px;
cursor: pointer;
font-size: 1rem;
background-color: #f0f0f0;
transition: background-color 0.3s ease, color 0.3s ease;
}

.accept-button.active {
    background-color: #aef0d1;
}

.accept-button:hover {
    background-color: #aef0d1;
}
.reject-button.active {
    background-color: #ffc0c2;
}
.reject-button:hover {
    background-color: #ffc0c2;
}



.invitation-details {
display: flex;
flex-direction: column; /* 세로 정렬 */
gap: 0.2rem; /* 텍스트 간격 */
}

.invitation-owner {
font-size: 0.9rem;
color: #666; /* 초대자 텍스트 색상 */
}

.date-range {
font-size: 0.9rem;
color: #666; /* 일정 범위 텍스트 색상 */
}

.invitation-content {
display: flex;
flex-direction: row; /* 가로 배치 */
justify-content: space-between;
align-items: center;
}


</style>
