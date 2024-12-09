<template>
  <div class="reservation-page">
    <Dialog v-model:visible="isVisible" :style="{ width: '50vw' }" @hide="cancel" modal>
      <div class="reservation-info">
        <p>장소: {{ resourcePlace }}</p>
        <p>회의실 명: {{ resourceName }}</p>
        <p>수용인원: {{ resourceCapacity }}</p>
      </div>
      <div class="reservation-detail">
        <p>예약 날짜: {{ formatKST(start) }} ~ {{ formatKST(end) }}</p>
        <span>참석자 추가: </span>
        <InputText type="text" v-model="value1" placeholder="이름 입력" @input="() => searchUsers(value1)" />
        <ul v-if="searchResults.length" class="user-list">
          <li v-for="user in searchResults" :key="user.userId" class="user-item">
            <span>{{ user.name }}</span>
            <Button
              icon="pi pi-user-plus"
              @click="addMember(user)"
              class="p-button-text p-button-success"
            />
          </li>
        </ul>
        <p v-else-if="value1.trim() && !searchResults.length">검색 결과가 없습니다.</p>
        <div>
          <h4>참석자 목록:</h4>
          <ul>
            <li v-for="attendee in selectedAttendees" :key="attendee.user_id">
              {{ attendee.name }}
              <Button
                icon="pi pi-user-minus"
                class="p-button-text p-button-danger"
                @click="removeMember(attendee)"
              />
            </li>
          </ul>
        </div>
        <form @submit.prevent="handleReservation">
          <div>
            <label for="title">회의 제목:</label>
            <input v-model="formData.title" id="title" required />
          </div>
          <div>
            <label for="description">회의 내용:</label>
            <textarea v-model="formData.content" id="description" required></textarea>
          </div>
        </form>
      </div>
      <div class="reservation-user">
        <p>주관자: {{ user.userName || "정보 없음" }}</p>
        <p>이메일: {{ user.email || "정보 없음" }}</p>
        <p>전화번호: {{ user.phoneNumber || "정보 없음" }}</p>
      </div>
      <Button @click="handleReservation">확인</Button>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { InputText } from "primevue";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  resourceId: { type: [String, Number], required: true },
  resourceName: { type: String, required: true },
  resourcePlace: { type: String, required: true },
  resourceCapacity: { type: Number, required: true },
});

const emit = defineEmits(["closeDialog"]);
const { start, end, resourceId, resourceName, resourcePlace, resourceCapacity } = props;

const isVisible = ref(true);
const value1 = ref("");
const searchResults = ref([]);
const selectedAttendees = ref([]);
const authStore = useAuthStore();
const user = ref({});
const formData = ref({
  title: "",
  description: "",
});

const formatKST = (utcTime) => {
  const date = new Date(utcTime);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const fetchUserInfo = async () => {
  if (!authStore.user.userId) {
    console.error("userId가 없습니다.");
    return;
  }
  try {
    const userData = await axios.get(`/user/${authStore.user.userId}`);
    user.value = userData.data.data;
  } catch (error) {
    console.error("사용자 정보를 가져오는 중 오류 발생:", error);
  }
};

const searchUsers = async (keyword) => {
  try {
    const sanitizedKeyword = keyword.trim();
    if (!sanitizedKeyword) {
      searchResults.value = [];
      return;
    }

    const response = await axios.get(`/user/search`, {
      params: {
        keyword: sanitizedKeyword,
      },
    });

    if (response.data.data) {
      searchResults.value = response.data.data.filter((user) =>
        user.name.includes(sanitizedKeyword)
      );

    } else {
      searchResults.value = [];
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    searchResults.value = [];
  }
};

const addMember = (user) => {
  // 주관자인 경우 추가 불가
  if (user.userId === authStore.user.userId) {
    alert("주관자는 참석자로 추가할 수 없습니다.");
    return;
  }

  // 이미 참석자로 추가된 경우 추가 불가
  if (selectedAttendees.value.some((attendee) => attendee.userId === user.userId)) {
    alert("이미 추가된 사용자입니다.");
    return;
  }

  // 참석자 추가
  selectedAttendees.value.push(user);
};

const removeMember = (user) => {
  selectedAttendees.value = selectedAttendees.value.filter(
    (attendee) => attendee.userId !== user.userId
  );
};

const handleReservation = async () => {
  const reservationData = {
    title: formData.value.title,
    content: formData.value.content,
    startTime: new Date(start).toISOString(),
    endTime: new Date(end).toISOString(),
    meetingroomId: resourceId,
    userId: authStore.user.userId,
    // attendeeIds: selectedAttendees.value.map((user) => user.userId),
    attendeeIds: selectedAttendees.value.map((user) => user.userId),
  };
  console.log("회의실 예약정보: ", reservationData);

  try {

    const response = await axios.post("/meetingroom_reservation", reservationData);
    console.log("response확인: ", response);
    alert("회의실이 성공적으로 예약되었습니다!");
    emit("closeDialog");
  } catch (error) {
    console.error("예약 중 오류 발생:", error);
    alert("예약 중 오류가 발생했습니다.");
  }
};

fetchUserInfo();
</script>


<style scoped>
.reservation-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

form div {
  margin-bottom: 15px;
}

form label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

form input,
form textarea {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

form button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

form button:hover {
  background-color: #0056b3;
}
</style>
