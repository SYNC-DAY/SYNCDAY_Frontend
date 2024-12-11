<template>
    <Dialog 
      v-model:visible="isDialogVisible" 
      header="예약 상세 정보" 
      :style="{ width: '50vw' }"
      :modal="true"
      @hide="closeDialog"
    >
      <div v-if="details">
        <p><strong>제목:</strong> {{ details.title || "제목 없음" }}</p>
        <p><strong>장소:</strong> {{ details.meetingroom_place || "정보 없음" }}</p>
        <p><strong>시작 시간:</strong> {{ formatKoreanDate(details.start_time) || "정보 없음" }}</p>
        <p><strong>종료 시간:</strong> {{ formatKoreanDate(details.end_time) || "정보 없음" }}</p>
        <p><strong>참석자:</strong> {{ userNames }} </p>
        <!-- <ul>
          <li v-for="user in details.userInfo" :key="user.userId">
            {{ user.username }} 
          </li>
        </ul> -->
        <p><strong>예약자 이름:</strong> {{ user.userName || "정보 없음" }}</p>
        <p><strong>예약자 이메일:</strong> {{ user.email || "정보 없음" }}</p>
        <p><strong>예약자 전화번호:</strong> {{ user.phoneNumber || "정보 없음" }}</p>
        <div class="button-group">
          <!-- <Button label="닫기" @click="closeDialog" /> -->
          <Button 
            v-if="isFutureReservation && isOwner" 
            label="삭제" 
            class="delete-btn p-button-danger"
            @click="deleteReservation"
          />
        </div>
      </div>
      <div v-else>
        <p>로딩 중...</p>
      </div>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from "vue";
  import axios from "axios";
  import { useAuthStore } from "@/stores/auth";
  import { useToast } from 'primevue/usetoast';
  
  // Props와 Emits 정의
  const props = defineProps({
    scheduleId: { type: [String, Number], required: true },
  });
//   const emit = defineEmits(["closeDialog"]);
const emit = defineEmits(["closeDialog", "reservationDeleted"])
  // 상태 정의
  const details = ref(null);
  const user = ref({});
  const authStore = useAuthStore();
  const isDialogVisible = ref(true);
  const toast = useToast();
  const { scheduleId } = props;

  // 예약 정보 가져오기
  const fetchReservationDetails = async () => {
    try {
        const response = await axios.get(`meetingroom_reservation/${scheduleId}`);
        const dataArray = response.data.data; // 응답 데이터가 배열로 반환
        console.log("에약 정보: ", response);
        if (dataArray.length > 0) {
            const utcStartTime = dataArray[0].start_time; // UTC 시간
            const utcEndTime = dataArray[0].end_time; // UTC 시간

            // UTC -> KST 변환 (Date 객체로 유지)
            const timeZone = 'Asia/Seoul';
            const startTimeKST = new Date(
                new Date(utcStartTime).toLocaleString('en-US', { timeZone })
            );
            const endTimeKST = new Date(
                new Date(utcEndTime).toLocaleString('en-US', { timeZone })
            );

            details.value = {
                ...dataArray[0],
                start_time: startTimeKST, // Date 객체
                end_time: endTimeKST,    // Date 객체

            };

            console.log("KST Start Time (Date): ", startTimeKST);
            console.log("KST End Time (Date): ", endTimeKST);
        } else {
            console.error("예약 정보가 비어 있습니다.");
        }
    } catch (error) {
        console.error("예약 상세 정보를 가져오는 중 오류 발생:", error);
    }
};



  
        // 사용자 정보 가져오기
        const fetchUserInfo = async () => {
            if (!authStore.user.userId) {
                console.error("userId가 없습니다.");
                return;
            }
            try {
                const response = await axios.get(`/user/${authStore.user.userId}`);
                user.value = response.data.data;
            } catch (error) {
                console.error("사용자 정보를 가져오는 중 오류 발생:", error);
            }
        };

// const fetchAttendees = async () => {
//   try {
//     const response = await axios.get(`/meetingroom_reservation/${scheduleId}/attendees`);
//     details.value.attendees = response.data; // 참석자 정보 추가
//   } catch (error) {
//     console.error("참석자 정보를 가져오는 중 오류 발생:", error);
//   }
// };


  // 예약 삭제
  const deleteReservation = async () => {
    // if (confirm("정말 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/meetingroom_reservation/${props.scheduleId}`);
        // alert("예약이 삭제되었습니다.");
        toast.add({
          severity: "success",
          summary: "회의실 예약 삭제",
          detail: "회의실 예약이 삭제되었습니다!",
          life: 3000,
      });
        emit("reservationDeleted", props.scheduleId); // 부모에게 삭제된 ID 전달
        emit("closeDialog"); // 부모 컴포넌트로 닫기 이벤트 전달
      } catch (error) {
        console.error("예약 삭제 중 오류 발생:", error);
      }
    // }
  };

  // Dialog 닫기
  const closeDialog = () => {
    emit("closeDialog"); // 부모 컴포넌트로 닫기 이벤트 전달
  };
  
  // 예약이 미래의 것인지 확인
//   const isFutureReservation = computed(() => {
//     if (details.value && details.value.end_time) {
//       return new Date(details.value.end_time) > new Date();
//     }
//     return false;
//   });
  
const isFutureReservation = computed(() => {
    console.log("details확인: ", details);
    return details.value?.end_time > new Date();
});
  // 예약 소유자인지 확인
  const isOwner = computed(() => {
    return details.value && details.value.user_id === user.value.userId;
  });

  const cancel = () => {
  emit("closeDialog");
};

const userNames = computed(() => {
  return details.value.userInfo.map(user => user.username).join(", ");
});

const formatKoreanDate = (date) => {
    if (!(date instanceof Date)) {
        throw new Error("Input must be a Date object");
    }

    // 요일 배열
    const days = ['일', '월', '화', '수', '목', '금', '토'];

    // 필요한 데이터 추출
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 결과 문자열 조합
    return `${year}년 ${month}월 ${day}일(${dayOfWeek}) ${hours}시 ${minutes.toString().padStart(2, '0')}분`;
  };

  
  // 컴포넌트 로드 시 데이터 가져오기
  onMounted(() => {
    fetchReservationDetails();
    fetchUserInfo();
    // fetchAttendees(); 
  });
  </script>
  
  <style scoped>
  .button-group {
    display: flex;
    margin-top: 20px;
    justify-content: flex-end;
    align-items: flex-end;
  }
  
  .delete-btn {
    background-color: #ff4d4f;
    color: white;
    border: none;
  }
  
  .delete-btn:hover {
    background-color: #ff7875;
  }
  </style>
  