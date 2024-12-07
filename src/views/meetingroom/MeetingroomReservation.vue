<template>
  <div class="reservation-page">
    <Dialog v-model:visible="isVisible" :style="{ width: '50vw' } " @hide="cancel">
      <div class="reservation-info">
        <p>장소: {{ resourcePlace }}</p>
        <p>회의실 명: {{ resourceName }}</p>
        <p>수용인원: {{ resourceCapacity }}</p>
      </div>
      <div class="reservation-detail">
        <p>예약 날짜: {{ formatKST(start)  }} ~ {{ formatKST(end) }}</p>
        <form @submit.prevent="handleReservation">
          <div>
            <label for="title">회의 제목:</label>
            <input v-model="formData.title" id="title" required />
          </div>
          <div>
            <label for="description">회의 내용:</label>
            <textarea v-model="formData.description" id="description" required></textarea>
          </div>
        </form>
      </div>
      <div class="reservation-user">
        <p>주관자: {{ user.userName || "정보 없음" }}</p>
        <p>이메일: {{ user.email || "정보 없음" }}</p>
        <p>전화번호: {{ user.phoneNumber || "정보 없음" }}</p>
      </div>
      <!-- <button @click="$emit('closeDialog')">취소</button> -->
      <Button @click="handleReservation">확인</Button>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";

import axios from "axios";
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
const visible1 = ref(false);
const authStore = useAuthStore();
const user = ref({});
const formData = ref({
  title: "",
  description: "",
});


// 한국 표준시(KST) 형식으로 변환하는 함수
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

// 사용자 정보 가져오기
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

// 예약 정보 제출
const handleReservation = async () => {
  const reservationData = {
    title: formData.value.title,
    description: formData.value.description,
    startTime: new Date(start).toISOString(),
    endTime: new Date(end).toISOString(),
    meetingroomId: resourceId,
    userId: authStore.user.userId, 
  };

  try {
    const response = await axios.post("/meetingroom_reservation", reservationData);
    console.log("API 응답:", response.data);
    alert("회의실이 성공적으로 예약되었습니다!");
    emit("closeDialog");
  } catch (error) {
    console.error("예약 중 오류 발생:", error);
    alert("예약 중 오류가 발생했습니다.");
  }
};

// 취소 버튼 클릭 시
const cancel = () => {
  emit("closeDialog");
};

// 컴포넌트가 렌더링될 때 사용자 정보를 가져옵니다.
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
