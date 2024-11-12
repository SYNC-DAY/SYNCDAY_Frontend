<template>
    <div class="mb-4">
      <div class="flex items-start" :class="{ 'flex-row-reverse': message.isMine }">
        <img :src="message.avatar" class="w-8 h-8 rounded-full" />
        <div 
          class="mx-2 p-3 rounded-lg"
          :class="[
            message.isMine 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-100'
          ]"
        >
          {{ message.content }}
        </div>
        <span class="text-xs text-gray-500">{{ message.time }}</span>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    message: {
      type: Object,
      required: true
    }
  })
  </script>
  
  <style scoped>
</style>