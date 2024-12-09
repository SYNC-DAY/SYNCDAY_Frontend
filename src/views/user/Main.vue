<template>
  <div class="mainpage-container">
    <div class="widget-container">
      <div class="content-container">
        <div class="title-container">
          <p class="widget-title">달력</p>
        </div>
        <MainCalendar></MainCalendar>
      </div>
    </div>
    <div class="widget-container">
      <div class="content-container">
        <div class="title-container">
          <p class="widget-title">일정 초대</p>
        </div>
        <div class="invitaion-container">
          <ScheduleInvitaion class="invitation"></ScheduleInvitaion>
        </div>
      </div>
    </div>
    <div class="widget-container">
      <div class="content-container">
        <div class="title-container">
          <p class="widget-title">진행중인 카드</p>
        </div>
        <DoingCard></DoingCard>
      </div>
    </div>
    <div class="widget-container">
      <div class="content-container">
        <div class="title-container">
          <p class="widget-title">팀 최신 게시글</p>
        </div>
        <TeamBoardList/>
      </div>
    </div>
  </div>
</template>

    
  <script setup>
  
    import { onMounted, ref } from 'vue';
    import { useAuthStore } from '@/stores/auth';
    import { useRouter } from 'vue-router';
    import MainCalendar from './components/MainCalendar.vue';
    import dayGridPlugin from '@fullcalendar/daygrid';
    import timeGridPlugin from '@fullcalendar/timegrid';
    import ScheduleInvitaion from './components/ScheduleInvitaion.vue';
    import TeamBoardList from './components/TeamBoardList.vue';
    import DoingCard from './components/DoingCard.vue';
    
    const authStore = useAuthStore();
    const router = useRouter();
    const widgets = ref([]);
  
    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        router.push('/login');
      }
    })
  
  
  </script>
  
  <style scoped>
  .mainpage-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 1rem; /* 위젯 간 간격 */
    overflow-y: auto;
}

.widget-container {
    margin: 1rem;
    width: calc(50% - 5rem);
    height: 70vh; /* 고정 높이 */
    max-height: 70vh; /* 위젯 최대 높이 제한 */
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0; /* 크기 변동 방지 */
}

.content-container {
    width: 100%;
    height: 100%;
    border: 1px solid #009688;
    border-radius: 2.5rem;
    box-shadow: 0 1.5px 3px rgba(59, 122, 63, 0.5);
    overflow-y: auto; /* 스크롤 가능 */
    display: flex;
    flex-direction: column; /* 제목과 내용을 세로로 정렬 */
    padding: 1rem;
}

.title-container {
    padding: 0.5rem 1rem;
    background-color: #ffffff;
    font-size: 1.2rem;
    font-weight: bold;
    border-bottom: 1px solid #009688; /* 주황색 경계선 추가 */
    border-radius: 2rem 2rem 0 0; /* 상단 둥근 모서리 */
    margin-bottom: 1rem; /* 제목과 내용 간 여백 */
}


  
  </style>