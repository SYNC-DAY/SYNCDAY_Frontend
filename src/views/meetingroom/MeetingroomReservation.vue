<template>
  <div class="reservation-page">
    <Dialog v-model:visible="isVisible" :style="{ width: '40vw' }"  header="회의실 예약" @hide="cancel" modal>
      
      <div class="reservation-info">
        <li><strong>장소:</strong> {{ resourcePlace }}</li>
        <li><strong>회의실 명:</strong> {{ resourceName }}</li>
        <li><strong>수용 인원:</strong> {{ resourceCapacity }}명</li>
      </div>
      <div class="reservation-detail">
        <li><strong>예약 날짜:</strong> {{ formatKST(start) }} ~ {{ formatKST(end) }}</li>
        <!-- <p>예약 날짜: {{ formatKST(start) }} ~ {{ formatKST(end) }}</p> -->
        <li>
          <strong>참석자 추가: </strong>
          <!-- <InputText type="text" v-model="value1" placeholder="참석자 이름을 입력하세요" @input="() => searchUsers(value1)" /> -->
          <InputText type="text" v-model="value1" placeholder="참석자 이름을 입력하세요" @input="() => searchUsers(value1)"/>
          <Listbox v-model="selectedUser" :options="searchResults" optionLabel="name" style="width: 16.5vw" emptyMessage="검색 결과가 없습니다." class="name">
            <template #option="slotProps">
              <div class="user-item">
                <span>{{ slotProps.option.name }}</span>
                <Button icon="pi pi-user-plus" class="p-button-text p-button-success ml-2" @click.stop="addMember(slotProps.option)"/>
              </div>
            </template>
          </Listbox>
        </li>

        <!-- <span>참석자 추가: </span>
        <InputText type="text" v-model="value1" placeholder="이름 입력" @input="() => searchUsers(value1)" /> -->
          <!-- <Listbox
  v-model="selectedUser" 
  :options="searchResults"
  optionLabel="name"
  class="w-full"
/>
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

        <p v-else-if="value1.trim() && !searchResults.length">검색 결과가 없습니다.</p> -->


<div class="reservation-attendee">
  <strong>참석자 목록</strong>
  <ul class="attendee-list">
    <li 
      v-for="attendee in selectedAttendees" 
      :key="attendee.user_id" 
      class="attendee-item"
    >
      <span>{{ attendee.name }}</span>
      <Button
        icon="pi pi-user-minus"
        class="p-button-text p-button-danger"
        @click="removeMember(attendee)"
      />
    </li>
  </ul>
</div>
        <!-- <div class="reservation-attendee">
          <li><strong>참석자 목록</strong>
            <li v-for="attendee in selectedAttendees" :key="attendee.user_id" class="attendee">
              {{ attendee.name }}
              <Button
                icon="pi pi-user-minus"
                class="p-button-text p-button-danger"
                @click="removeMember(attendee)"
              />
            </li>
          </li> -->
          <!-- <span>참석자 목록</span>
          <ul>
            <li v-for="attendee in selectedAttendees" :key="attendee.user_id">
              {{ attendee.name }}
              <Button
                icon="pi pi-user-minus"
                class="p-button-text p-button-danger"
                @click="removeMember(attendee)"
              />
            </li>
          </ul> -->
        <!-- </div> -->
        <form @submit.prevent="handleReservation">
          
          <div>
            <label for="title">회의 제목</label>
            <!-- <input v-model="formData.title" id="title" required /> -->
            <Textarea v-model="formData.title" id="title" required />
          </div>
          <div>
            <label for="description">회의 내용</label>
            <Textarea v-model="formData.content" id="description" required/>
          </div>
        </form>
      </div>
      <Divider />
      <div class="reservation-user">
        <li><strong>주관자: </strong> {{ user.userName || "정보 없음" }}</li>
        <li><strong>이메일: </strong> {{ user.email || "정보 없음" }}</li>
        <li><strong>전화번호: </strong> {{ user.phoneNumber || "정보 없음" }}</li>

      </div>
      <Divider />
      <div class="reservation-button">
        <Button @click="handleReservation">예약</Button>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { InputText } from "primevue";
import { useAuthStore } from "@/stores/auth";
import Textarea from "primevue/textarea";
import Divider from 'primevue/divider';
import Listbox from 'primevue/listbox';
import { useToast } from 'primevue/usetoast';

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
const selectedUser = ref("");
const searchResults = ref([]);
const selectedAttendees = ref([]);
const authStore = useAuthStore();
const user = ref({});
const toast= useToast();
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
    // alert("주관자는 참석자로 추가할 수 없습니다.");
    toast.add({
      severity: "warn",
      summary: "멤버 추가 실패",
      detail: "주관자는 참석자로 추가할 수 없습니다!",
      life: 3000,
    });
    return;
  }

  // 이미 참석자로 추가된 경우 추가 불가
  if (selectedAttendees.value.some((attendee) => attendee.userId === user.userId)) {
    // alert("이미 추가된 사용자입니다.");
    toast.add({
      severity: "warn",
      summary: "이미 추가된 사용자",
      detail: "이미 추가된 사용자입니다!",
      life: 3000,
    });
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
    console.log("response확인: ", response.data);
    if (response.data.data === null) {
      // alert("예약 중 오류가 발생했습니다.");
      toast.add({
        severity: "warn",
        summary: "회의실 예약",
        detail: "이미 예약되어있는 시간입니다!",
        life: 3000,
    });
      emit("closeDialog");
    }
    else {
      // alert("회의실이 성공적으로 예약되었습니다!");
      toast.add({
        severity: "success",
        summary: "회의실 예약",
        detail: "회의실이 성공적으로 예약되었습니다!",
        life: 3000,
    });
    emit("closeDialog");
    }

  } catch (error) {
    console.error("예약 중 오류 발생:", error);
    // alert("예약 중 오류가 발생했습니다.");
    toast.add({
        severity: "danger",
        summary: "회의실 예약",
        detail: "예약중 오류가 발생했습니다.",
        life: 3000,
    });
    
  }
};

fetchUserInfo();
</script>

<style scoped>
.reservation-info li {
  margin-bottom: 2%;
}

.reservation-info strong{
  font-weight: bold;
}

.reservation-detail strong {
  font-weight: bold;
}

.reservation-page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.reservation-detail p{
  margin-top: 1%;
  margin-left: 17%;
}

.reservation-attendee {
  margin-top: 2%;
  margin-bottom: 2%;
}

.name {
  margin-left: 5rem;
}

.reservation-attendee .attendee li {
  margin-left: 17%;
}

.attendee-list {
  display: flex;
  flex-wrap: wrap; /* 줄바꿈 가능 */
  /* list-style: none; */
  /* padding: 0;
  margin: 0; */
  gap: 2%; 
}

.attendee-item {
  margin-top: 1%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid #ccc; /* 테두리 */
  border-radius: 5px; /* 둥근 모서리 */
  background-color: #f9f9f9; /* 배경색 */
  /* gap: 8px; */
  min-width: 120px; /* 최소 박스 너비 */
}

.reservation-user li {
  margin-bottom: 1%;
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
  /* background-color: #007bff; */
  background-color: #15B8A6;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

form button:hover {
  /* background-color: #0056b3; */
  background-color: #15B8A6;
}

.reservation-button {
  text-align: right;
}
</style>
