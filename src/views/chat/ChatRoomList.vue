<template>
    <div>
      <div v-if="isVisible" class="popup" :draggable="true">
        <button class="close-button" @click="closePopup">X</button>
        <div class="popup-content">
          <p>채팅</p>
          <div class="newchat">
            <button class="new-chat" @click="createNewChatRoom">새 채팅</button>
            </div>
            <div >
              <input class="chat-search" type="text" placeholder="이름, 채팅방 명 검색 " @input="searchChat($event)"/>
            </div>
            <div class= "chatlist">
              <ul>
                <li v-for="chat in filteredChatList" :key="chat.roomId" @click="openChatRoom(chat)" class="chat-room">
                  <h4>{{ chat.chatRoomName }}</h4>
                  <p>{{ chat.lastMessage || '메시지가 없습니다' }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <NewChatRoom v-if="isPopupVisible" @close="closeNewChatRoom"/>
        <ChatRoom  v-if="selectedRoom" :roomId="chat.roomId"
        :chatRoomName="room.chatRoomName"  @close="closeChatRoom"/>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import axios from 'axios';
  import NewChatRoom from '@/views/chat/chat_components/NewChatRoom.vue';
  import ChatRoom from './ChatRoom.vue';

const isVisible = ref(true); 
const chatList = ref([]);   
const searchQuery = ref(''); 
const isPopupVisible = ref(false);
const selectedRoom = ref(null);
const authStore = useAuthStore();
// 채팅방 목록 닫기
const closePopup = () => {
  isVisible.value = false;
};

// 새채팅 모달
const createNewChatRoom = () => {
  console.log('새 채팅방 생성 모달!');
  isPopupVisible.value = true
}
const closeNewChatRoom = () => {
  console.log('새채팅 모달 종료')
  isPopupVisible.value = false;
}
// 채팅방 열기
const openChatRoom = (chat) => {
  console.log(`${chat.roomId}번 채팅방 열기`);
  selectedRoom.value = chat;
};

// 채팅방 닫기
const closeChatRoom = () => {
  selectedRoom.value = null;
};
// 채팅방 데이터 가져오기
const fetchChatRooms = async () => {
  
  try {
    console.log('authStore.user.userId:', authStore.user.userId); 
    const response = await axios.get('/chat/room',{params: { userId: authStore.user.userId }});
    console.log('API 요청 URL: ', axios.defaults.baseURL + '/chat/room');
    console.log('응답데이터: ', response.data)
    chatList.value = response.data;
  } catch (error) {
    console.error('채팅방 목록을 가져오는 중 오류 발생:', error);
  }
};

// 채팅방 필터링
const filteredChatList = computed(() => {
  return chatList.value.filter((chat) =>
    chat.chatRoomName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});


// 검색 필터링
const searchChat = (event) => {
  searchQuery.value = event.target.value.toLowerCase();
};

// 컴포넌트가 로드될 때 데이터 가져오기
onMounted(() => {
  console.log("sfs", authStore.user.userId)
  fetchChatRooms();
});

  </script>
  
  <style scoped>
  .popup {
    position: absolute;
    top: 50px; /* 아이콘 아래로 50px */
    left: 85%;
    transform: translateX(-50%);
    width: 30rem;
    height: 60%;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }
  
  /* 팝업 콘텐츠 */
  .popup-content {
    padding: 10px;
    overflow-y: auto; /* 내용이 길어지면 스크롤 */
  }
  
  .popup-content p {
    font-size: 2rem;
    font-weight: bold;
    margin: 1rem;
    margin-bottom: 0rem;
  }
  
  .closePopup {
    size: 2rem;
  }
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: #c7c5c5;
  }
  
  .close-button:hover {
    color: #686666;
  }
  
  .new-chat {
  background-color: #ff9d85;
  border-radius: 3px;
  font-size: 1rem;
  color: rgb(43, 43, 43);
  border: none;
  cursor: pointer;
  margin-bottom: 0.5rem;
  margin-left: 22rem;
}

.new-chat:hover {
  background-color: #fc8d71;
}

  .chat-room {
    border-bottom: 1px solid #ddd;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .chat-room:hover {
    background-color: #f5f5f5;
  }
  
  .chat-room h4 {
    margin: 0;
    font-size: 16px;
  }
  
  .chat-room p {
    margin: 5px 0 0;
    font-size: 5%;
    color: #666;
  }
  
  .chat-search {
    border-radius: 7px;
    background-color: #d6d5d5 ;
    font-size: 1rem;
    width: 80%;
    margin-left: 2.5rem;
  }
  .chatlist {
  margin-top: 1rem;
}
  .chatlist h4 {
  font-size: 1rem;
}

.chatlist ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
  </style>