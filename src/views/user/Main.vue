<template>

  <div class="mainpage-container">
    <div class="widget-container">
      <div class="content-container">
        <MainCalendar></MainCalendar>
      </div>
    </div>
    <div class="widget-container">
        <div class="title-container">
          <p class="widget-title">북마크한 카드</p>
        </div>
        <div class="content-container">
        </div>
      </div>
      <div class="widget-container">
        <div class="title-container">
        </div>
        <div class="content-container">
          <div class="invitaion-container">
            <ScheduleInvitaion></ScheduleInvitaion>
          </div>
        </div>
      </div>
      <div class="widget-container">
        <div class="title-container">
          <p class="widget-title">팀 게시판</p>
          <TeamBoardList/>
        </div>
        <div class="content-container">
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
  
    .mainpage-container{
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: left;
      gap: 2rem;
      padding: 2rem;
    }
  
    .widget-container{
      width: calc(50% - 1rem);
      height:calc(80% - 1rem);
      box-sizing: border-box;
      position: relative;
      padding: 1rem;
    }
  
    .title-container {
      position: absolute; 
      top: 1rem; 
      left: 5rem; 
      padding: 0 1rem; 
      font-size: 1.5rem;
      z-index: 1; 
      background-color: white;
  }
  
    .content-container{
      padding: 2rem;
      width:100%;
      height:100%;
      border: 1px solid #FF9D85;
      border-radius: 2.5rem;
      box-shadow: 0 4px 8px rgba(255, 157, 133, 0.5); /* 그림자 효과 */
    }

  
  
  
  </style>