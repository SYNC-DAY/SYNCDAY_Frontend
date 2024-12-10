<template>
  <div class="calendar-setting">
    <span>회의실 예약</span>
    <div class="calender-1">
      <FullCalendar :options="calendarOptions" ref="calendar1" />
    </div>
    <div class="filter-area">
      <select v-model="selectedRoomName" @change="filterRooms">
        <option value="">----</option>
        <option v-for="place in uniquePlaces" :key="place" :value="place">
          {{ place }}
        </option>
      </select>
    </div>
    <div class="calendar-section">
      <p v-if="selectedRoomName === ''" class="select-message">장소를 선택해주세요.</p>
      <p v-else class="selected-room">선택된 장소: {{ selectedRoomName }}</p>
      <p class="selected-date">날짜: {{ selectedDate }}</p>
      <FullCalendar v-if="selectedRoomName !== ''" :options="calendarOptions2" ref="calendar2" />
    </div>
    <Button
      v-if="showReservationButton"
      label="예약하기"
      class="reservation-button"
      :style="buttonStyles"
      @click="navigateToReservation"
    />
        <!-- 예약 모달 -->
        <MeetingroomReservation
      v-if="isReservationDialogVisible"
      :start="reservationDetails.start"
      :end="reservationDetails.end"
      :resourceId="reservationDetails.resourceId"
      :resourceName="reservationDetails.resourceName"
      :resourcePlace="reservationDetails.resourcePlace"
      :resourceCapacity="reservationDetails.resourceCapacity"
      @closeDialog="closeReservationDialog"
    />


    <MeetingroomDetails
      v-if="isDetailsDialogVisible"
      :scheduleId="selectedScheduleId"
      @closeDialog="closeDetailsDialog"
      @reservationDeleted="handleReservationDeleted"
    />
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import MeetingroomReservation from "./MeetingroomReservation.vue";
import MeetingroomDetails from "./MeetingroomDetails.vue";
import Button from "primevue/button";
import { ref } from "vue";

import axios from "axios";


export default {
  components: { FullCalendar, Button, MeetingroomReservation, MeetingroomDetails },
  data() {
    return {
      selectedRoomName: "",
      rooms: [],
      filteredRooms: [],
      reservations: [], // 초기화
      reservationData: {},
      selectedDate: new Date().toISOString().split("T")[0],
      showReservationButton: false,
      buttonStyles: {},
      isReservationDialogVisible: false,
      isDetailsDialogVisible: false, // 상세 정보 모달 표시 여부
      reservationDetails: {}, // 예약 정보 저장
      selectedScheduleId: null, // 선택된 예약 ID
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        dateClick: (info) => {
          alert(`선택된 날짜: ${info.dateStr}`);
          this.highlightDate(info.dateStr);
          this.handleDateClick(info);
        },
        events: [],
      },
      calendarOptions2: {
        schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
        plugins: [resourceTimelinePlugin, interactionPlugin],
        initialView: "resourceTimelineDay",
        headerToolbar: false,
        slotDuration: "00:10:00",
        slotLabelInterval: "01:00:00",
        slotLabelFormat: {
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
        },
        selectable: true,
        select: this.handleSelectEvent,
        eventClick: this.handleEventClick,
        slotMinTime: "0:00:00",
        slotMaxTime: "24:00:00",
        resources: [],
        events: [],
      },
    };
  },
  computed: {
    uniquePlaces() {
      return [...new Set(this.rooms.map((room) => room.meetingroom_place))];
    },
  },
  methods: {
    //현재 회의실 불러오기 
    async fetchRooms() {
      await axios.get("/meetingroom").then((response) => {
        this.rooms = response.data.data || [];
        this.filteredRooms = this.rooms.filter(
          (room) => room.meetingroom_place === this.selectedRoomName
        );
      });
    },
    handleEventClick(info) {
    const event = info.event;
    const scheduleId = event.id; // 예약 ID를 이벤트에서 가져옴

    // 상세 정보 모달 열기
    this.openDetailsDialog(scheduleId);
  },

    // 필터링 된 회의실 
    filterRooms() {
      if (this.selectedRoomName === "") {
        this.filteredRooms = [];
        this.reservationData = {};
        this.$router.push({ path: "/meetingroom" });
      } else {
        // 겹치는 듯??
        this.filteredRooms = this.rooms.filter(
          (room) => room.meetingroom_place === this.selectedRoomName
        );
        
        this.fetchReservations(this.selectedRoomName);
        this.updateResources();
        this.$router.push({
          path: "/meetingroom",
          query: { place: this.selectedRoomName },
        });
      }
    },

    //예약된 정보 가져오기
    async fetchReservations(selectedRoomPlace) {
      await axios 
        .get("/meetingroom_reservation/by-place", {
          params: { meetingroom_place: selectedRoomPlace },
        })
        .then((response) => {
          const scheduleMap = {};
          response.data.data.forEach((reservation) => {
            const { schedule_id, meeting_time, meetingroom_id, userInfo } = reservation;
            if (!scheduleMap[schedule_id]) {
              scheduleMap[schedule_id] = {
                id: schedule_id,
                // title: `예약 ID: ${schedule_id}`,
                title: `예약자: ${userInfo[0].username}`,
                start: meeting_time,
                end: meeting_time,
                resourceId: meetingroom_id,
              };
            } else {
              if (
                new Date(meeting_time) > new Date(scheduleMap[schedule_id].end)
              ) {
                scheduleMap[schedule_id].end = meeting_time;
              }
            }
          });

          const events = Object.values(scheduleMap).map((schedule) => ({
            ...schedule,
            end: new Date(
              new Date(schedule.end).getTime() + 10 * 60 * 1000
            ),
          }));

          const calendar2Api = this.getCalendar2Api();
          if (calendar2Api) {
            calendar2Api.removeAllEvents();
            calendar2Api.addEventSource(events);
          }
        })
        .catch((error) => {
          console.error("예약 데이터를 가져오는 중 오류 발생:", error);
        });
    },


    updateResources() {
      const resources = this.filteredRooms.map((room) => ({
        id: room.meetingroom_id,
        title: room.meetingroom_name,
        
        // 추가추가
        place: room.meetingroom_place, // 장소 추가
        capacity: room.meetingroom_capacity, // 수용인원 추가
      }));
      const calendar2Api = this.getCalendar2Api();
      if (calendar2Api) {
        calendar2Api.setOption("resources", resources);
      }
    },

    getCalendar2Api() {
      const calendar2Ref = this.$refs.calendar2;
      return calendar2Ref ? calendar2Ref.getApi() : null;
    },

    highlightDate(dateStr) {
      const calendar1Api = this.$refs.calendar1.getApi();
      if (calendar1Api) {
        calendar1Api.removeAllEvents();
        calendar1Api.addEvent({
          start: dateStr,
          allDay: true,
          display: "background",
          backgroundColor: "lightblue",
        });
      }
    },

    handleDateClick(info) {
      this.selectedDate = info.dateStr;
      const calendar2Api = this.getCalendar2Api();
      if (calendar2Api) {
        calendar2Api.gotoDate(info.dateStr);
      }
    },

    handleSelectEvent(info) {
      const { start, end, resource, jsEvent } = info;

      const now = new Date();
      if (start < now) {
        alert("지난 시간은 예약할 수 없습니다.");
        return;
      }

      if (!start || !end || !resource || !resource.id) {
        alert("올바른 예약 데이터를 선택해주세요.");
        return;
      }

      this.showReservationButton = true;

      const rect = jsEvent.target.getBoundingClientRect();
      
      this.buttonStyles = {
        position: "absolute",
        zIndex: 1000,
        top: `${rect.bottom + window.scrollY}px`, // 선택된 칸의 하단에 배치
        left: `${rect.left + window.scrollX}px`,
        padding: "10px 20px",
      };

      this.reservationDetails = {
        start: start.toISOString(),
        end: end.toISOString(),
        resourceId: resource.id,
        resourceName: resource.title,
        resourcePlace: resource.extendedProps?.place || "장소 없음",
        resourceCapacity: resource.extendedProps?.capacity || 0,
      };

      console.log("예약 정보 업데이트:", this.reservationDetails);
    },
    
    navigateToReservation() {
  if (!this.reservationDetails || !this.reservationDetails.resourceId) {
    alert("예약 정보를 확인해주세요.");
    return;
  }

  console.log("예약 정보:", this.reservationDetails);

// 버튼을 숨김
this.showReservationButton = false;

// 모달 열기 상태를 false로 했다가 다시 true로 변경
this.isReservationDialogVisible = false;
this.$nextTick(() => {
  this.isReservationDialogVisible = true;
});

  console.log("isReservationDialogVisible 상태:", this.isReservationDialogVisible);


},
async closeReservationDialog() {
      this.isReservationDialogVisible = false; // 모달 닫기
      console.log("모달이 닫혔습니다.");
      this.reservationDetails = {}; // 예약 세부 정보 초기화
      this.showReservationButton = false; // 버튼 초기화
      await this.fetchReservations(this.selectedRoomName);
    },

    openDetailsDialog(scheduleId) {
      this.selectedScheduleId = scheduleId;
      this.isDetailsDialogVisible = true;
    },
    closeDetailsDialog() {
      this.isDetailsDialogVisible = false;
      this.selectedScheduleId = null;

    },
   
    handleReservationDeleted(deletedScheduleId) {
    // reservations 배열에서 삭제된 예약을 필터링
    this.reservations = this.reservations.filter(
      (reservation) => reservation.schedule_id !== deletedScheduleId
    );

    // 캘린더 업데이트 (만약 캘린더를 사용 중이라면)
    const calendarApi = this.getCalendar2Api();
    if (calendarApi) {
      const event = calendarApi.getEventById(deletedScheduleId);
      if (event) {
        event.remove(); // 해당 이벤트를 캘린더에서 삭제
      }
    }
  },
  },



  mounted: async function () {
    const queryPlace = this.$route.query.place || "";
    this.selectedRoomName = queryPlace;
    await this.fetchRooms();
    if (queryPlace) {
      this.filterRooms();
    }
  },
};
</script>

<style scoped>
::v-deep(.calender-1 .fc) {
  width: 60%;
}

::v-deep(.fc-toolbar-title) {
  font-size: 1.0rem;
  width: 100%;
  margin-right: 30%;
}

::v-deep(.fc-button) {
  font-size: 0.7rem;
}

::v-deep(.fc-daygrid-day-frame) {
  height: 100%; /* 또는 원하는 높이 */
}

.calendar-setting {
  display: flex; 
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.calendar-setting span {
  font-size: 1.5rem;
  margin-top: 1%;
  margin-left: 1%;
  font-weight: bold;  

}

.calender-1 {
  display: flex;
  justify-content: center; 
  align-items: center;
}

.selected-room {
  margin-top: 3%;
  font-weight: bold;
  color: #333;
}

.selected-room p {
  font-size: 1.0rem;
}

.select-message {
  color: #ff0000;
  font-size: 16px;
  margin-bottom: 10px;
}

.calendar-section {
  width: 100%;
  height: auto;
  max-height: 400px; 
  overflow-y: hidden;
  margin-left: 1%; 
}

.filter-area select {
  margin-top: 1%;
  margin-left: 1%;
  margin-bottom: -5%;
}

.selected-date {
  margin-bottom: 2%;
  font-weight: bold;
}

.selected-date p {
  font-size: 1.0rem;
}

</style>
