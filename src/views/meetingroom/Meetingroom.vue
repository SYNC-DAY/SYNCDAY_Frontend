<template>
    <div class="calendar-setting">

      <div class="calender-1" >
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
        <p class="selected-date">
          날짜: {{ selectedDate }}
        </p>
        <FullCalendar v-if="selectedRoomName !== ''" :options="calendarOptions2" ref="calendar2" />
      </div>
    </div>
  </template>
  
  <script>
  import FullCalendar from "@fullcalendar/vue3";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import interactionPlugin from "@fullcalendar/interaction";
  import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
  import axios from "axios";
  
  export default {
    components: { FullCalendar },
    data() {
      return {
        selectedRoomName: "",
        rooms: [],
        filteredRooms: [],
        reservationData: {},
        selectedDate: new Date().toISOString().split("T")[0], 
        // 캘린더
        calendarOptions: {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: "dayGridMonth",
          dateClick: (info) => {
            alert(`선택된 날짜: ${info.dateStr}`);
            this.highlightDate(info.dateStr);
            this.handleDateClick(info); 
          },
          events: [], // 강조할 날짜를 이벤트로 추가
        },
  
        // 타임라인
        calendarOptions2: {
          schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
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
          select: this.handleSelectEvent, // 드래그 이벤트 핸들러
          eventClick: this.handleEventClick, // 이벤트 클릭 핸들러 추가
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
      // 회의실 데이터 가져오기
      async fetchRooms() {
        await axios.get("/meetingroom").then((response) => {
          this.rooms = response.data.data || [];

          this.filteredRooms = this.rooms.filter(
          room => room.meetingroom_place === this.selectedRoomName
        );
          console.log("fetchRooms: ", this.filteredRooms);
        });
      },

          // 이벤트 클릭 핸들러: 클릭 시 상세 페이지로 이동
      handleEventClick(info) {
      const event = info.event;

      // 라우터를 사용하여 예약 상세 페이지로 이동
      this.$router.push({
        name: "ReservationDetails", // 라우트 이름
        params: { id: event.id }, // 예약 ID를 URL 파라미터로 전달
      });
    },
  
      // 선택된 장소 필터링
      filterRooms() {
        if (this.selectedRoomName === "") {
          this.filteredRooms = [];
          this.reservationData = {};
          this.$router.push({ path: "/meetingroom" });
        } else {
          if (this.selectedRoomName === "전체") {
            this.filteredRooms = this.rooms;
          } else {
            this.filteredRooms = this.rooms.filter(
              (room) => room.meetingroom_place == this.selectedRoomName
            );
          }
          console.log("filteredRooms: ", this.filteredRooms);
  
          this.fetchReservations(this.selectedRoomName);
          this.updateResources();
  
          this.$router.push({
            path: "/meetingroom",
            query: { place: this.selectedRoomName },
          });
        }
      },
  
      // 예약 정보 가져오기
      fetchReservations(selectedRoomPlace) {
        axios.get("/meetingroom_reservation/by-place", {
          params: { meetingroom_place: selectedRoomPlace },
        })
        .then((response) => {
          // 데이터 병합: schedule_id를 기준으로 start와 end를 설정
          const scheduleMap = {};
          response.data.data.forEach((reservation) => {
          const { schedule_id, meeting_time, meetingroom_id } = reservation;
  
          if (!scheduleMap[schedule_id]) {
            scheduleMap[schedule_id] = {
              id: schedule_id,
              title: `예약 ID: ${schedule_id}`,
              
              start: meeting_time,
              end: meeting_time,
              resourceId: meetingroom_id,
            };
          } else {
            // 기존 스케줄의 종료 시간을 갱신
            if (new Date(meeting_time) > new Date(scheduleMap[schedule_id].end)) {
              scheduleMap[schedule_id].end = meeting_time;
            }
          }
        });
  
        // 병합된 데이터를 이벤트로 변환
        const events = Object.values(scheduleMap).map((schedule) => ({
          ...schedule,
          end: new Date(new Date(schedule.end).getTime() + 10 * 60 * 1000), // 10분 추가
        }));
  
        
        // 캘린더에 이벤트 추가
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
  
      // 두 번째 캘린더의 리소스 업데이트
      updateResources() {
        const resources = this.filteredRooms.map((room) => ({
          id: room.meetingroom_id,
          title: room.meetingroom_name,
        }));
  
        const calendar2Api = this.getCalendar2Api();
        if (calendar2Api) {
          calendar2Api.setOption("resources", resources);
        }
      },
  
      // 두 번째 캘린더 API 가져오기
      getCalendar2Api() {
        const calendar2Ref = this.$refs.calendar2;
        return calendar2Ref ? calendar2Ref.getApi() : null;
      },
  
      // 첫 번째 캘린더 날짜 강조
      highlightDate(dateStr) {
        const calendar1Api = this.$refs.calendar1.getApi();
        if (calendar1Api) {
          // 이전 강조 제거
          calendar1Api.removeAllEvents();
  
          // 새로운 날짜 강조
          calendar1Api.addEvent({
            start: dateStr,
            allDay: true,
            display: "background", // 배경 색상만 변경
            backgroundColor: "lightblue", // 강조 색상
          });
        }
      },
  
      // 첫 번째 캘린더 날짜 클릭 이벤트
      handleDateClick(info) {
        this.selectedDate = info.dateStr;
        const calendar2Api = this.getCalendar2Api();
        if (calendar2Api) {
          calendar2Api.gotoDate(info.dateStr);
        }
      },
  
      // 첫 번째 캘린더 날짜 변경 이벤트
      handleDatesSet(info) {
        const calendar2Api = this.getCalendar2Api();
        if (calendar2Api) {
          calendar2Api.gotoDate(info.startStr);
        }
        document.documentElement.style.setProperty("--resource-count", this.filteredRooms.length);
      },
  
      handleSelectEvent(info) {
      const { start, end, resource } = info;
  
      // 현재 시간과 비교
        const now = new Date();
        if (start < now) {
            alert("지난 시간은 예약할 수 없습니다.");
            return; // 예약 불가 처리
        }

      if (!start || !end || !resource || !resource.id) {
          console.error("예약 데이터를 가져오는 중 오류 발생: ", info);
          alert("올바른 예약 데이터를 선택해주세요.");
          return;
      }
  
      // 기존 버튼 제거 (중복 방지)
      const existingButton = document.querySelector(".reservation-button");
      if (existingButton) {
        existingButton.remove();
      }
  
      // 버튼 생성
      const button = document.createElement("button");
      button.innerText = "예약하기";
      button.className = "reservation-button";
  
      // 클릭 이벤트: 예약 페이지 이동
      button.onclick = () => {
        this.$router.push({
          path: "/meetingroom/reservation",
          query: {
            start: start.toISOString(),
            end: end.toISOString(),
            resourceId: resource.id,
          },
        });
      };
      
      button.style.position = "absolute";
      button.style.zIndex = 1000;
      button.style.top = `${info.jsEvent.clientY}px`; // 마우스 Y 좌표
      button.style.left = `${info.jsEvent.clientX}px`; // 마우스 X 좌표
      button.style.padding = "10px 20px";
      button.style.backgroundColor = "#007bff";
      button.style.color = "#fff";
      button.style.border = "none";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  
      // 캘린더에 버튼 추가
      const calendarContainer = this.$refs.calendar2.$el;
      calendarContainer.appendChild(button);
  
      // 자동으로 버튼 제거 (5초 뒤)
      setTimeout(() => {
        if (button.parentNode) {
          button.remove();
        }
      }, 5000); // 5초 후 버튼 자동 삭제
    },
  
      
    },
    mounted: async function() {
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
  
  .calender-1 {
    display: flex;
    justify-content: center; 
    align-items: center;
  }
  
  .selected-room {
    margin-top: 5%;
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
  }
  
  .selected-date {
    margin-bottom: 2%;
    font-weight: bold;
  }
  
  .selected-date p {
    font-size: 1.0rem;
  }
  
  </style>