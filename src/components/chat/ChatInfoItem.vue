<template>
    <div 
      class="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100"
      :class="{ 'justify-center': isCollapsed }"
      @click="$emit('click')"
    >
      <ChatAvatar 
        :src="room.avatar"
        :name="room.name"
        :unreadCount="room.unreadCount"
        :isCollapsed="isCollapsed"
      />
      
      <div v-if="!isCollapsed" class="ml-3 flex-1">
        <div class="flex justify-between">
          <span class="font-medium">{{ room.name }}</span>
          <span class="text-sm text-gray-500">{{ room.lastMessageTime }}</span>
        </div>
        <p class="text-sm text-gray-600 truncate">{{ room.lastMessage }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import ChatAvatar from './ChatAvatar.vue'
  
  defineProps({
    room: {
      type: Object,
      required: true
    },
    isCollapsed: {
      type: Boolean,
      default: false
    }
  })
  
  defineEmits(['click'])
  </script>
  