<template>
    <div class="flex-1 border-l transition-all duration-300">
      <ChatRoomDetailHeader 
        :room="room"
        @close="$emit('close')"
      />
      
      <ChatMessageList :messages="room.messages" />
      
      <ChatMessageInput @send="handleSend" />
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import ChatRoomDetailHeader from './ChatRoomDetailHeader.vue'
  import ChatMessageList from './ChatMessageList.vue'
  import ChatMessageInput from './ChatMessageInput.vue'
  
  const props = defineProps({
    room: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['close', 'send-message'])
  
  const handleSend = (message) => {
    emit('send-message', props.room.id, message)
  }
  </script>
  