<template>
    <div class="chat-list">
      <!-- 채팅 리스트 헤더 -->
      <ChatRoomHeader />
  
      <!-- 채팅방 목록 -->
      <ul class="space-y-2 p-4">
        <li 
          v-for="room in chatRooms" 
          :key="room.id" 
          @click="selectRoom(room)"
          class="p-2 rounded-lg cursor-pointer hover:bg-gray-100"
        >
          <ChatInfoItem :room="room" />
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  import ChatRoomHeader from './ChatRoomHeader.vue'
  import ChatInfoItem from './ChatInfoItem.vue'
  
  // 채팅방 목록 데이터와 선택된 채팅방 상태 정의
  const chatRooms = ref([])
  const selectedRoom = ref(null)
  
  // 채팅방 목록 데이터를 가져오는 함수
  async function fetchChatRooms() {
    try {
      const response = await axios.get('http://localhost:8080/api/chat/rooms')
      chatRooms.value = response.data
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    }
  }
  
  // 채팅방 선택 핸들러
  function selectRoom(room) {
    selectedRoom.value = room
    // 선택된 채팅방 정보를 부모 컴포넌트에 전달
    emit('select-room', room)
  }
  
  // 컴포넌트 마운트 시 채팅방 목록 데이터를 가져옴
  onMounted(() => {
    fetchChatRooms()
  })
  </script>
  
  <style scoped>
  .chat-list {
    width: 300px;
    border-right: 1px solid #ddd;
  }
  </style>
  