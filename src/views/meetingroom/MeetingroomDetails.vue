<template>
    <div class="reservation-details">
        <h1>예약 상세 정보</h1>
        <div v-if="details">
            <p><strong>제목:</strong> {{ details.title || "제목 없음" }}</p>
            <p><strong>장소:</strong> {{ details.meetingroom_place || "제목 없음" }}</p>
            <p><strong>시작 시간:</strong> {{ details.start_time || "정보 없음" }}</p>
            <p><strong>종료 시간:</strong> {{ details.end_time || "정보 없음" }}</p>
            <p><strong>예약자 이름:</strong> {{ user.userName || "정보 없음" }}</p>
            <p><strong>예약자 이메일:</strong> {{ user.email || "정보 없음" }}</p>
            <p><strong>예약자 전화번호:</strong> {{ user.phoneNumber || "정보 없음" }}</p>
  
            <!-- 현재 시간과 비교하여 버튼 렌더링 -->
            <div class="button-group">
                <button @click="goBack">확인</button>
                <button 
                  v-if="isFutureReservation && isOwner" 
                  @click="deleteReservation" 
                  class="delete-btn">
                  삭제
                </button>
            </div>
        </div>
        <div v-else>
            <p>로딩 중...</p>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watchEffect } from "vue"; // Vue 3 Composition API
import axios from "axios";
import { useRoute, useRouter } from "vue-router"; // Vue Router 사용
import { useAuthStore } from "@/stores/auth";

export default {
    setup() {
        const route = useRoute(); // URL 파라미터 접근
        const router = useRouter();
        const scheduleId = route.params.id; // URL 파라미터로 전달된 ID
  
        const authStore = useAuthStore();
        const user = ref({}); // 현재 사용자 정보
        const details = ref(null); // 예약 상세 정보
  
        // 예약 정보 가져오기
        const fetchReservationDetails = async () => {
          try {
              const response = await axios.get(`meetingroom_reservation/${scheduleId}`);
              const dataArray = response.data.data; // 응답 데이터가 배열로 반환
              if (dataArray.length > 0) {
                  details.value = dataArray[0]; // 첫 번째 항목 사용
                  console.log("details: ", details);
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

        
  
        // 현재 시간과 비교하여 과거 예약인지 확인
        const isFutureReservation = computed(() => {
            if (details.value && details.value.end_time) {
                const currentTime = new Date();
                const endTime = new Date(details.value.end_time);
                return endTime > currentTime;
            }
            return false;
        });


        // 본인 예약인지 확인
        const isOwner = computed(() => {
            if (details.value && user.value) {
                console.log("User ID:", user.value.userId);
                console.log("Reservation User ID:", details.value.user_id);
                return details.value.user_id === user.value.userId; // 예약자 ID와 현재 사용자 ID 비교
            }
            return false;
        });

        // 데이터 로드 후 값 확인
        watchEffect(() => {
            console.log("User Data:", user.value);
            console.log("Details Data:", details.value);
        });
  
        // 확인 버튼: 이전 화면으로 돌아가기
        const goBack = () => {
            router.push({
                path: "/meetingroom",
                query: {
                place: details.value.meetingroom_place,
      
            },
            });
        } 
        // 삭제 버튼: 예약 삭제
        const deleteReservation = async () => {
            const confirmDelete = confirm("정말로 이 예약을 삭제하시겠습니까?");
            if (confirmDelete) {
                try {
                    await axios.delete(`/meetingroom_reservation/${scheduleId}`);
                    alert("예약이 성공적으로 삭제되었습니다.");
                    router.push({
                        path: "/meetingroom",
                        query: {
                        place: details.value.meetingroom_place,
      
                    },
            });
                } catch (error) {
                    console.error("예약 삭제 중 오류 발생:", error);
                    alert("예약 삭제 중 오류가 발생했습니다.");
                }
            }
        };
  
        onMounted(() => {
            fetchReservationDetails(); // 예약 정보 로드
            fetchUserInfo(); // 사용자 정보 로드
        });
  
        return {
            user,
            details,
            goBack,
            deleteReservation,
            isFutureReservation,
            isOwner, // 추가
        };
    },
};
</script>
