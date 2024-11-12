<template>
    <div class="h-16 border-b px-4 flex items-center">
      <button @click="$emit('close')" class="mr-4">←</button>
      <h2 class="font-medium">{{ room.name }}</h2>
    </div>
  </template>
  
  <script setup>
  defineProps({
    room: {
      type: Object,
      required: true
    }
  })
  
  defineEmits(['close'])
  </script>