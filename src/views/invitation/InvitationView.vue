<template>
    <div v-if="invitations.length > 0" class="invitation-list">
    <h2>일정 초대 목록</h2>
    <table>
        <thead>
        <tr>
            <th class="title-header">일정명</th>
            <th class="start-header">시작</th>
            <th class="owner-header">초대자</th>
            <th class="attendance-header">참석 여부</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="invite in invitations" :key="invite.schedule_id">
            <td>{{ invite.title }}</td>
            <td>{{ formatDateTime(invite.start_time) }} ~ {{ formatDateTime(invite.end_time) }}</td>
            <td>
                <span class="inviter">
                    <img  alt="Crown Icon" class="crown-icon" />
                    {{ invite.schedule_owner_name  }}({{ invite.team_name }})
                </span>
            </td>
            <td>
                <button
                    :class="['reject-button',{ selected: invite.participation_status === 'ABSENT' }]"
                    @click="updateStatus(invite.schedule_id, 'ABSENT')"
                >
                    불참
                </button>
                <button
                :class="['accept-button', { selected: invite.participation_status === 'ATTEND' }]"
                    @click="updateStatus(invite.schedule_id, 'ATTEND')"
                >
                    참석
                </button>
            </td>
        </tr>
        </tbody>
    </table>
    </div>

    <div v-else class="invitation-list">
        <h2>일정 초대 목록</h2>
        <div class="no-invitation">
            <h3>초대된 일정이 존재하지 않습니다.</h3>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.user.userId;

const invitations = ref([]);

const fetchInvitations = async () => {
    try {
        const response = await axios.get(`/userschedule/my?userId=${userId}`);
        invitations.value = response.data.data;
        console.log(invitations.value)
    } catch (error) {
        console.error('Error fetching invitations:', error);
    }
};

const updateStatus = async (schedule_id, status) => {
    try {
        await axios.put(`/userschedule/status`, { 
            schedule_id: schedule_id,
            user_id:  userId,
            participation_status: status
        });
        const invite = invitations.value.find(invite => invite.schedule_id === schedule_id);
    if (invite) {
        invite.participation_status = status;
    }
    } catch (error) {
        console.error('Error updating status:', error);
    }
};

// Format date and time
const formatDateTime = (dateTime) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTime).toLocaleString('ko-KR', options);
};

onMounted(() => {
    fetchInvitations();
});
</script>

<style scoped>
.invitation-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
}
.reject-button{

}

.accept-button{
    background-color: rgb(117, 243, 180);
    border-color:rgb(117, 243, 180);
}

.selected {
    border-color: red;
    border-width: 10px;
}
</style>