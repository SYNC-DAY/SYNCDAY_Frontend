<template>
    <div class="h-16 border-t px-4 flex items-center">
      <input 
        type="text" 
        placeholder="메시지를 입력하세요" 
        class="flex-1 border rounded-lg px-4 py-2 mr-2"
        v-model="message"
        @keyup.enter="sendMessage"
      />
      <button 
        @click="sendMessage"
        class="bg-purple-500 text-white px-4 py-2 rounded-lg"
      >
        전송
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const emit = defineEmits(['send'])
  const message = ref('')
  
  const sendMessage = () => {
    if (!message.value.trim()) return
    emit('send', message.value)
    message.value = ''
  }
  </script>