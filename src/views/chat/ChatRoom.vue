<template>
    <div class="flex h-screen">
      <!-- 채팅방 목록 -->
      <ChatList 
        :rooms="chatRooms"
        :selectedRoom="selectedRoom"
        @select-room="selectRoom"
      />
  
      <!-- 채팅방 상세 보기 -->
      <ChatRoomDetail
        v-if="selectedRoom"
        :room="selectedRoom"
        @close="closeRoom"
        @send-message="handleSendMessage"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import ChatList from './ChatList.vue'
  import ChatRoomDetail from './ChatRoomDetail.vue'
  
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
    // 추가적인 채팅방 데이터
  ])
  
  const selectedRoom = ref(null)
  
  // 채팅방 선택 핸들러
  const selectRoom = (room) => {
    selectedRoom.value = room
  }
  
  // 채팅방 닫기 핸들러
  const closeRoom = () => {
    selectedRoom.value = null
  }
  
  // 메시지 전송 핸들러
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
  /* 스타일 정의 */
  </style>
  