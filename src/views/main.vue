<template>

<div class="mainpage-container">
  <div class="widget-container">
    <div class="content-container">
      <FullCalendar :options="calendarOptions" />     
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
        <p class="widget-title">일정 초대</p>
      </div>
      <div class="content-container">
      </div>
    </div>
    <div class="widget-container">
      <div class="title-container">
        <p class="widget-title">팀 게시판</p>
      </div>
      <div class="content-container">
      </div>
    </div>
</div>

</template>
  
<script setup>

  import { onMounted, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'
  import FullCalendar from '@fullcalendar/vue3';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid'
  
  const authStore = useAuthStore();
  const router = useRouter();
  const widgets = ref([]);
  const calendarOptions = ref({
    plugins: [dayGridPlugin,
      timeGridPlugin
    ],
    initialView: 'timeGridWeek',
    height: '100%'
  })

  const pushDummyWidget = ()=>{
    widgets.length = 0;
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.1",
      title: "예시 제목1",
      id: 1
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.2",
      title: "예시 제목2",
      id: 2
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.4",
      title: "예시 제목4",
      id: 4
    });
  }

  onMounted(async () => {
    if (!authStore.isAuthenticated) {
      router.push('/login');
    }
    pushDummyWidget();
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