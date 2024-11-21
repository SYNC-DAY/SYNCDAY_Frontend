<!-- App.vue 또는 다른 부모 컴포넌트 -->
<template>
  <div class="app">
    <SideBar>
      <ProjSideBarItem 
        title="MUDIUM" 
        :isActive="true"
      >
        <ProjSideBarItem title="Frontend" />
        <ProjSideBarItem title="Backend" />
      </ProjSideBarItem>
      
      <ProjSideBarItem title="Mudium_Backend" />
      <ProjSideBarItem title="Mudium_Frontend" />
      <ProjSideBarItem title="Mudium_DB" />
    </SideBar>
  </div>
</template>

<script setup>
import SideBar from '@/components/layout/SideBar.vue';
import ProjSideBarItem from './components/ProjSideBarItem.vue';
</script>