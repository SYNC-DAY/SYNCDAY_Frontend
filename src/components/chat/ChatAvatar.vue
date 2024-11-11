<template>
    <div 
      class="relative"
      :class="{ 'transform scale-75': isCollapsed }"
    >
      <img 
        :src="src" 
        :alt="name"
        class="w-12 h-12 rounded-full transition-transform duration-300"
      />
      <span 
        v-if="unreadCount"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
      >
        {{ unreadCount }}
      </span>
    </div>
  </template>
  
  <script setup>
  defineProps({
    src: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    unreadCount: {
      type: Number,
      default: 0
    },
    isCollapsed: {
      type: Boolean,
      default: false
    }
  })
  </script>