<template>
    <div class="p-4 flex justify-between items-center">
      <h1 class="text-xl font-bold" :class="{ 'hidden': isCollapsed }">채팅</h1>
      <button class="bg-purple-500 text-white px-4 py-2 rounded-lg">새 채팅</button>
    </div>
  </template>
  
  <script setup>
  defineProps({
    isCollapsed: {
      type: Boolean,
      default: false
    }
  })
  </script>
  <style scoped>
</style>