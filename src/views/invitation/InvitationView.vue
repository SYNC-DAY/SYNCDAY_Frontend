<template>
    <div v-if="invitations.length > 0" class="invitation-list">
      <h2 class="invitation-title">일정 초대 목록</h2>
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
          <tr v-for="invite in invitations" :key="invite.schedule_id">
            <td class="title-cell">{{ invite.title }}</td>
            <td class="time-cell">
              {{ formatDateTime(invite.start_time) }} ~ {{ formatDateTime(invite.end_time) }}
            </td>
            <td class="owner-cell">
              <span class="owner-info">
                <img alt="Crown Icon" class="crown-icon" />
                {{ invite.schedule_owner_name }} ({{ invite.team_name }})
              </span>
            </td>
            <td class="action-cell">
              <button
                class="reject-button"
                :class="{ selected: invite.participation_status === 'ABSENT' }"
                @click="updateStatus(invite.schedule_id, 'ABSENT')"
              >
                불참
              </button>
              <button
                class="accept-button"
                :class="{ selected: invite.participation_status === 'ATTEND' }"
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
      <h2 class="invitation-title">일정 초대 목록</h2>
      <div class="no-invitation">
        <h3>초대된 일정이 존재하지 않습니다.</h3>
      </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const userId = authStore.user.userId;

const invitations = ref([]);

const fetchInvitations = async () => {
  try {
    const response = await axios.get(`/userschedule/my?userId=${userId}`);
    invitations.value = response.data.data;
    console.log(invitations.value);
  } catch (error) {
    console.error("Error fetching invitations:", error);
  }
};

const updateStatus = async (schedule_id, status) => {
  try {
    await axios.put(`/userschedule/status`, {
      schedule_id: schedule_id,
      user_id: userId,
      participation_status: status,
    });
    const invite = invitations.value.find(
      (invite) => invite.schedule_id === schedule_id
    );
    if (invite) {
      invite.participation_status = status;
    }
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

// Format date and time
const formatDateTime = (dateTime) => {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateTime).toLocaleString("ko-KR", options);
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
  height: auto;
}

.invitation-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.invitation-table {
  width: 80%;
  border-collapse: collapse;
  font-size: 1rem;
  text-align: left;
}

.invitation-table th {
  background-color: #f9f9f9;
  padding: 1rem;
  border-bottom: 2px solid #e9e9e9;
  font-weight: bold;
}

.invitation-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9e9e9;
}

.owner-info {
  display: flex;
  align-items: center;
}

.crown-icon {
  width: 1.2rem;
  height: 1.2rem;
  margin-right: 0.5rem;
}

.action-cell {
  display: flex;
  gap: 0.5rem;
}

.reject-button,
.accept-button {
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s ease;
  background-color: #fff;
  border-color: black;
}


.reject-button.selected {
    background-color: #ffc0c2;
}

.reject-button:hover {
  background-color: #ffc0c2;
}


.accept-button.selected {
    background-color: #aef0d1;
}

.accept-button:hover {
  background-color: #aef0d1;
}

.no-invitation {
  font-size: 1.2rem;
  color: #888;
}
</style>
