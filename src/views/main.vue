<template>
  <div class="button-container move">
    <button class="move-button">
      <img src="@/assets/images/move.svg" alt="move">
    </button>
  </div>
  <div class="mainpage-container">
    <template v-for="widget in widgets" :key="widget.id">
      <div class="widget-container">
        <div class="title-container">
          <p class="widget-title">{{ widget.title }}</p>
        </div>
        <div class="content-container">
          {{ widget.item }}
        </div>

      </div>
    </template>
    <div class="button-container plus">
      <div class="content-container plus-button-container">
        <button class="plus-button">
          <img src="@/assets/images/plus-circle.svg" alt="add">
        </button>
      </div>

    </div>
  </div>

</template>
  
<script setup>

  import { onMounted, ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import { useRouter } from 'vue-router'

  const authStore = useAuthStore();
  const router = useRouter();
  const widgets = ref([]);

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
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
    });
    widgets.value.push({
      item: "여기에 내용이 표시됩니다.3",
      title: "예시 제목3",
      id: 3
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
    background-color: #f5f5f5;
  }

  .widget-container{
    width: calc(50% - 3rem);
    height:calc(50% - 3rem);
    box-sizing: border-box;
    position: relative;
    padding: 2rem;
  }

  .title-container {
    position: absolute; 
    top: 1rem; 
    left: 5rem; 
    background-color: #f5f5f5; 
    padding: 0 1rem; 
    font-size: 1.5rem;
    z-index: 1; 
}

  .content-container{
    padding: 2rem;
    width:100%;
    height:100%;
    border: 1px solid #FF9D85;
    border-radius: 2.5rem;
    box-shadow: 0 4px 8px rgba(255, 157, 133, 0.5); /* 그림자 효과 */
  }

  .move{
    position: absolute;
    top: 10%; 
    right: 3rem; 
  }


  .plus{
    width: calc(50% - 3rem);
    height:calc(50% - 3rem);
    box-sizing: border-box;
    position: relative;
    padding: 2rem;
  }

  .plus-button-container{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .button-container button{
    width: 5rem;
    height: 5rem;
    border: none;
    background-color: #f5f5f5;
  }

  .button-container button:hover{
    width: 5rem;
    height: 5rem;
    border: none;
    background-color: #d7d7d7;
    border-radius: 2rem;
  }

  .button-container img{
    width: 100%;
    height: 100%;
  }


</style>