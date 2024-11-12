<template>
    <div>
      <!-- 메시지 목록 -->
      <div v-for="message in messages" :key="message.id">
        <p><strong>{{ message.sender }}:</strong> {{ message.content }}</p>
      </div>
  
      <!-- 메시지 입력 필드 -->
      <input 
        v-model="inputMessage" 
        @keyup.enter="sendMessage" 
        placeholder="메시지 입력" 
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import SockJS from 'sockjs-client'
  import { Client as StompClient } from '@stomp/stompjs'
  
  // 웹소켓을 통해 주고받는 메시지와 상태 정의
  const stompClient = ref(null)
  const messages = ref([])
  const inputMessage = ref('')
  
  // 컴포넌트가 마운트될 때 웹소켓 연결 설정
  onMounted(() => {
    connect()
  })
  
  // 컴포넌트가 언마운트될 때 웹소켓 연결 해제
  onUnmounted(() => {
    if (stompClient.value) {
      stompClient.value.deactivate()
    }
  })
  
  function connect() {
    const socket = new SockJS('http://localhost:8080/ws') // 서버 웹소켓 엔드포인트
    stompClient.value = new StompClient({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('Connected to WebSocket')
        
        // 메시지 수신을 위한 구독 설정
        stompClient.value.subscribe('/topic/public', (tick) => {
          const message = JSON.parse(tick.body)
          messages.value.push(message)
        })
      },
      debug: (str) => {
        console.log(str)
      }
    })
  
    stompClient.value.activate()
  }
  
  function sendMessage() {
    if (inputMessage.value.trim() && stompClient.value) {
      const message = {
        sender: 'User', // 실제 사용자 이름으로 변경 가능
        content: inputMessage.value,
        type: 'CHAT'
      }
  
      // 서버로 메시지 전송
      stompClient.value.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      })
  
      inputMessage.value = '' // 메시지 입력 필드 초기화
    }
  }
  </script>
  
  <style scoped>
  /* 스타일 정의 */
  </style>
  