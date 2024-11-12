<template>
    <div 
      class="transition-all duration-300"
      :class="[selectedRoom ? 'w-24' : 'w-96']"
    >
      <ChatRoomHeader :isCollapsed="!!selectedRoom" />
      
      <div class="space-y-2 p-4">
        <ChatRoomItem
          v-for="room in rooms"
          :key="room.id"
          :room="room"
          :isCollapsed="!!selectedRoom"
          @click="$emit('select-room', room)"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  import ChatRoomHeader from './ChatRoomHeader.vue'
  import ChatInfoItem from './ChatInfoItem.vue'
  
  defineProps({
    rooms: {
      type: Array,
      required: true
    },
    selectedRoom: {
      type: Object,
      default: null
    }
  })
  
  defineEmits(['select-room'])
  </script>

  <style scoped>
</style>