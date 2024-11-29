<template>
    <div class="reservation-page">
        <h1>회의실 예약 정보</h1>
        <div class="reservation-info">
            <p>장소: {{ resourcePlace }}</p>
            <p>회의실 명: {{ resourceName }}</p>
            <p>수용인원: {{ resourceCapacity }}</p>
        </div>
        <div class="reservation-detail"> 
            <p>예약 날짜: {{ formatKST(start) }} ~ {{ formatKST(end) }}</p>
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
            <p>주관자: </p>
            <p>부서명: </p>
            <p>이메일: </p>
            <p>전화번호: </p>
        </div>
        <button type="submit">예약취소</button>
        <button type="submit">확인</button>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

// 폼 데이터
const formData = ref({
  title: "",
  description: "",
});

// 예약 관련 정보
const start = ref("");
const end = ref("");
const resourceId = ref("");
const resourceName = ref("");
const resourceCapacity = ref(0);
const resourcePlace = ref("");
// 라우터 객체
const router = useRouter();

// 한국 표준시(KST) 형식으로 변환하는 함수
const formatKST = (utcTime) => {
  const date = new Date(utcTime); // UTC 시간 문자열을 Date 객체로 변환
  date.setHours(date.getHours()); 

  // 'YYYY-MM-DD HH:mm:ss' 형식으로 변환
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

const fetchResourceName = async () => {
  try {
    const response = await axios.get(`/meetingroom/${resourceId.value}`);
    const data = response.data.data;
    resourceName.value = data.meetingroom_name; // 회의실 이름
    resourceCapacity.value = data.meetingroom_capacity; // 수용인원
    resourcePlace.value = data.meetingroom_place; 
  } catch (error) {
    console.error("회의실 정보를 가져오는 중 오류가 발생하였습니다.", error);
    resourceName.value = "알 수 없음";
  }
};

const handleReservation = async () => {
  const reservationData = {
    title: formData.value.title,
    description: formData.value.description,
    startTime: new Date(start.value).toISOString(),
    endTime: new Date(end.value).toISOString(),
    meetingroomId: resourceId.value,
    
};

  try {
    await axios.post("/meetingroom_reservation", reservationData);
    alert("회의실이 성공적으로 예약되었습니다!");
    this.$router.push("/meetingroom");
  } catch (error) {
    console.error("예약 중 오류 발생", error);
    alert("예약 중 오류가 발생했습니다.");
  }
};

// 라우트 파라미터 설정
onMounted(() => {
  const route = useRoute();
  start.value = route.query.start;
  end.value = route.query.end;
  resourceId.value = route.query.resourceId;

  fetchResourceName();
});
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