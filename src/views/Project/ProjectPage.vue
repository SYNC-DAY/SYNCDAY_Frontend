<template>
  <div class="project-container">
    <div class="content-wrapper">
      <SideBar :menu-items="currentItems"/>
      <div class="main-content">
        <h1>Project</h1>
        <!-- 메인 콘텐츠가 들어갈 자리 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import SideBar from "@/components/layout/SideBar.vue";
// currentItems 데이터 정의 필요
const currentItems = ['메뉴1', '메뉴2', '메뉴3']; // 예시
</script>

<style scoped>
.project-container {
  width: 100%;
  height: 100vh;
  min-height: calc(100vh - 6rem);
  display: flex;
  flex-direction: column;
}

.project-header h1 {
  margin: 0;
}

.content-wrapper {
  flex: 1;
  display: flex;
  width: 100%;
}

.main-content {
  flex: 1;
  padding: 2rem;
}
</style>