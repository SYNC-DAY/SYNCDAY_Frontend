<!-- ChatRoom.vue -->
<template>
  <div v-if="isVisible" class="popup">
    <button class="close-button" @click="$emit('close')">X</button>
    <button class="leave-chat" @click="leaveChat">채팅방 나가기</button>
    <div class="popup-content">
      <h2>{{ props.chatRoomName }}</h2>
      <div class="chat-messages">
        <template v-for="(message, index) in messages" :key="index" class="message-line">
          <div v-if="shouldShowDate(index)" class="date-divider">
            {{ formatDate(messages[index].sentTime) }}
          </div>
          <div class="message-line">
            <img :src="message.userProfileImg" alt="프로필 이미지" class="profile-img" />
            <div class="message-content">
              <span class="sender">{{ message.senderName }}</span>
              <div class="content-and-time">
                <span class="content">{{ message.content }}</span>
                <span class="time-right">{{ message.sentTime }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" type="text" placeholder=" 메시지를 입력하세요" @keyup.enter="sendMessage" />
        <button @click="sendMessage">전송</button>
      </div>
    </div>
  </div>


</template>

<script setup>
  import { onUnmounted, onMounted, ref, defineProps, computed } from 'vue';
  import SockJS from 'sockjs-client';
  import { Client } from '@stomp/stompjs';
  import { useAuthStore } from '@/stores/auth';
  import axios from 'axios';
import { conformsTo } from 'lodash';

  const props = defineProps({
    roomId: {
      type: String,
      required: true
    },
    chatRoomName: {
      type: String,
      required: true
    },
    removeChatFromList: {
      type: Function,
      required: true
    }
  });

  const authStore = useAuthStore()
  const connectionStatus = ref('웹 소켓 시작')
  const isConnected = ref(false)
  const stompClient = ref(null)
  const isVisible = ref(true);
  const messages = computed(() => messagesInRoom.value[props.roomId] || []);
  const newMessage = ref(''); // 새 입력 메세지
  const subscriptions = ref({}) // 토픽 구독 채팅방 연결
  const messagesInRoom = ref({})  // 각 채팅방 당 메세지


// 날짜 설정
const formatDate = (timeString) => {
  const date = new Date(timeString);
  return `---------- ${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, "0")}월 ${String(date.getDate()).padStart(2, "0")}일 ----------`
}
// 시간 설정
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? '오전' : '오후';

    return `${ampm} ${hours}:${minutes}`;
  };
  const shouldShowDate = (index) => {
    if (index === 0) return true;
    const currentDate = formatDate(messages.value[index].sentTime);
    const previousDate = formatDate(messages.value[index - 1].sentTime);
    return currentDate !== previousDate;
  };

  const connectWebSocket = () => {
    console.log('웹소켓 연결 시도 중...')
    if (stompClient.value?.connected) {
      console.log('이미 웹소켓이 연결되어 있습니다.');
      return;
    }

    // 환경변수나 설정에서 URL을 가져오는 것이 좋습니다
    const socket = new SockJS(`http://localhost:5000/ws?token=${authStore.accessToken}`, null, {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling']
    });

    stompClient.value = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // 재연결 시간 줄임
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: function (str) {
        console.log('웹소켓 연결 상태: ', str)
        isConnected.value = true;
      },
      onConnect: (frame) => {
        console.log('STOMP 연결됨(success!!!): ' + frame)
        isConnected.value = true
        connectionStatus.value = '연결됨'
        subscribeToRoom(props.roomId) // 연결 성공 시 구독 실행
      },
      onStompError: (frame) => {
        console.error('STOMP 오류:', frame)
        isConnected.value = false;
        handleConnectionFailure('STOMP 오류: ' + frame.headers['messages'])
      },
      onDisconnect: () => {
        console.log('STOMP 연결 끊김');
        isConnected.value = false;
        connectionStatus.value = '연결 끊김';
        reconnectWebSocket();
      },
    });


    try {
      console.log('activate: ', stompClient.value)
      stompClient.value.activate()
      console.log('클라이언트 활성화 호출 성공!')
    } catch (error) {
      console.error('STOMP 클라이언트 활성화 실패:', error)
      isConnected.value = false;
    }
  }

  const subscribeToRoom = (roomId) => {
    if (subscriptions.value[roomId]) {
      console.warn(`이미 방 ${roomId}에 구독 중입니다.`);
      return;
    }

  subscriptions.value[roomId] = stompClient.value.subscribe(`/topic/room/${roomId}`, message => {
    console.log('메시지 수신:', message.body)
        const receivedMessage = JSON.parse(message.body); // 메시지 JSON 파싱
        receivedMessage.sentTime = formatDate(receivedMessage.sentTime);
        receivedMessage.sentTime = formatTime(receivedMessage.sentTime);
    if (!messagesInRoom.value[roomId]) {
      messagesInRoom.value[roomId] = []
    }
    console.log("메세지:", receivedMessage)
    // messagesInRoom.value[roomId].push(receivedMessage)
    messagesInRoom.value[roomId] = [...messagesInRoom.value[roomId], receivedMessage]
  })
};


  /** WebSocket 재연결 */
  const reconnectWebSocket = () => {
    setTimeout(() => {
      if (!isConnected.value) connectWebSocket();
    }, 5000);
  };

  const fetchMessages = async (roomId) => {

  try {
    const response = await axios.get(`/chat/room/${roomId}/message`);
    console.log('메세지 데이터 가져오기');
      messagesInRoom.value[roomId] = response.data.map(message => ({
        ...message,
        sentTime: formatDate(message.sentTime),
        sentTime: formatTime(message.sentTime),
      }
      ));
    } catch (error) {
      console.error('채팅 메시지 불러오기 실패:', error);
      messagesInRoom.value[roomId] = [];
    }
  };


  const sendMessage = () => {
    console.log('전송 시도~!')
    console.log('현재 메시지 값:', newMessage.value);
    if (!newMessage.value || !newMessage.value.trim()) {
      console.warn('빈 메시지는 전송할 수 없습니다.');
      return;
    }

    if (!isConnected.value) {
      console.error('웹소켓에 연결되지 않았습니다. 연결을 시도합니다...');
      connectWebSocket(); // 연결 시도
      return;
    }

    const chatMessage = {
      content: newMessage.value.trim(),
      roomId: props.roomId,
      senderId: authStore.user?.userId,
      senderName: authStore.user?.name,
      userProfileImg: authStore.user?.userProfileImg,
      chatType: 'TALK',
      sentTime: new Date().toISOString(),
    };

    try {
      console.log("publish")
      stompClient.value.publish({
        destination: `/app/room/${props.roomId}`,
        body: JSON.stringify(chatMessage),
      });
      newMessage.value = ''; // 메시지 초기화
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
    }

  };


  const leaveChat = async () => {
  try {
    const response = await axios.post(`/chat/room/${props.roomId}/leave`, null, {
      params: { userId: authStore.user?.userId },
    });
    console.log('채팅방 나가기 응답: ', response.data);

    if (response.data.success) {
      isVisible.value = false;
      props.removeChatFromList(props.roomId);
      console.log('채팅방 나가기 성공: ', props.removeChatFromList);

      if (subscriptions.value[props.roomId]) {
        subscriptions.value[props.roomId].unsubscribe();
        delete subscriptions.value[props.roomId];
      }
      delete messagesInRoom.value[props.roomId];
      console.log('해당 채팅방 메세지들 삭제. 구독 취소')
    } else {
      console.error('채팅방 나가기 실패: ', response.data.error.message);
      alert('채팅방 나가기에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('채팅방 나가는 중 오류 발생:', error);
    alert('오류가 발생했습니다. 다시 시도해주세요.');
  }
};


  // 컴포넌트가 마운트될 때 메시지 로드
  onMounted(() => {
    console.log('마운트: ', props.roomId)
    fetchMessages(props.roomId);
    connectWebSocket(); // WebSocket 연결
  });

  onUnmounted(() => {
    if (props.roomId && messagesInRoom.value[props.roomId]) {
      console.log(`채팅방 ${props.roomId}의 모든 데이터 초기화`);
      delete messagesInRoom.value[props.roomId];
      if (subscriptions.value[props.roomId]) {
        subscriptions.value[props.roomId].unsubscribe();
        delete subscriptions.value[props.roomId];
      }
    } else {
      console.warn('언: 유효하지 않은 roomId');
    }
  });

</script>

<style scoped>
.popup {
  position: absolute;
  top: 50px;
  right: 0%;
  transform: translateX(-50%);
  width: 30%;
  height: 70%;
  background-color: #f7f6f6;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
} 

  .leave-chat {
    position: absolute;
    margin-top: 1rem;
    margin-bottom: 1rem;
    top: 15px;
    right: 10px;
    background: none;
    border-color: #ffdae7;
    border-style:solid;
    border-radius: 20rem;
    font-size: 0.9rem;
    cursor: pointer;
    color: #c7c5c5;
  }
  .leave-chat:hover{
    background-color: #ffe7ec;
  }

  .popup-content {
    padding: 20px;
    display: flex;
    overflow-y: auto;
    /* 내용이 길어지면 스크롤 */
    flex-direction: column;
    height: 100%;
  }

h2 {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 15px;
  overflow-y: auto;
  padding: 10px;
  background-color: #fdf6f9;
  border-radius: 5px;
  margin-bottom: 20px;
}

.chat-messages::-webkit-scrollbar {
  width: 8px; /* 세로 스크롤바 크기 */
  height: 8px; /* 가로 스크롤바 크기 */
}

/* 스크롤바의 막대 */
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #ffe0ea; /* 색상 */
  border-radius: 4px; /* 둥근 모서리 */
}

.date-divider {
  text-align: center;
  font-size: 0.7rem;
  color: #aaaaaa;
  margin: 10px 0;
}

.message-line {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.profile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-left: 0.5rem;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 0.5rem;
}

.sender {
  font-size: 12px;
}

.content-and-time {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content {
  padding: 10px;
  border-radius: 8px;
  max-width: 400px;
  font-size: 14px;
}

.time-right {
  font-size: 0.6rem;
  color: #aaaaaa;
  margin-left: 10px;
  align-self: flex-end;
}

.time {
  font-size: 0.5rem;
}


.chat-input {
    display: flex;
    gap: 10px;
    height: 2.5rem;
    border: none;
}

.chat-input input {
  font-size: 0.9rem;
  width: 23rem;
  border-color: #c7c5c5;
  border-style: solid;
  border-radius: 5px;
}
.chat-input button {
  /* padding: 8px 16px; */
  background-color: #fd8eaa;
  color: #fcfcfc;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 1rem;
}

.chat-input button:hover {
  background-color: #fc7294;
}

.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 0.8rem;
    cursor: pointer;
    color: #c7c5c5;
}

.close-button:hover {
    color: #333;
}
</style>