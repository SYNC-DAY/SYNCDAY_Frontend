<template>
  <div class="app-container">
    <AppHeader userName="홍길동" profileImageUrl="https://via.placeholder.com/32" />
    <div class="main-container">
      <SideBar :menuItems="currentMenuItems" />
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
// import Navigation from './components/layout/Navigation.vue';
import AppHeader from './components/layout/AppHeader.vue';
import SideBar from './components/layout/SideBar.vue';

const userSidebars = {
  project: ['Proj 1', 'Proj 2', 'Proj 3', 'Proj 4'],
  calendar: ['Cal 1', 'Cal 2', 'Cal 3'],
}

const currentMenuItems = ref(userSidebars.project);
</script>
<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-container {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
}

.content {
  flex-grow: 1;
  padding: 1rem;
}
</style>