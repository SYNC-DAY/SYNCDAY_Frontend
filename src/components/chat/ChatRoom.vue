<template>
    <div class="flex h-screen">
      <ChatRoomList 
        :rooms="chatRooms"
        :selectedRoom="selectedRoom"
        @select-room="selectRoom"
      />
      
      <ChatRoomDetail
        v-if="selectedRoom"
        :room="selectedRoom"
        @close="selectedRoom = null"
        @send-message="handleSendMessage"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import ChatRoomList from './components/ChatRoomList.vue'
  import ChatRoomDetail from './components/ChatRoomDetail.vue'
  
  const chatRooms = ref([
    {
      id: 1,
      name: '김동혁',
      avatar: '/avatar1.jpg',
      lastMessage: '네, 현실 엔드스 좋아요~',
      lastMessageTime: '오전 9:31',
      unreadCount: 10,
      messages: []
    },
    // ... 더 많은 채팅방 데이터
  ])
  
  const selectedRoom = ref(null)
  
  const selectRoom = (room) => {
    selectedRoom.value = room
  }
  
  const handleSendMessage = (roomId, messageContent) => {
    const room = chatRooms.value.find(r => r.id === roomId)
    if (!room) return
    
    const message = {
      id: Date.now(),
      content: messageContent,
      time: new Date().toLocaleTimeString(),
      isMine: true,
      avatar: '/my-avatar.jpg'
    }
    
    room.messages.push(message)
    room.lastMessage = messageContent
    room.lastMessageTime = message.time
  }
  </script>
  
  <style scoped>
  /* 필요에 따라 스타일 추가 */
  </style>
  