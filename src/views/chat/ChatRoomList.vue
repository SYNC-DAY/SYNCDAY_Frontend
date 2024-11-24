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
            <!-- <div class= "chatlist">
              <ul>
                <li v-for="chat in chatlist" :key="chat.id" @click="openChatRoom(chat.id)" class="chat-room">
                  <h4>{{ chat.name }}</h4>
                  <p>{{ chat.lastMessage }}</p>
                </li>
              </ul>
            </div> -->
          </div>
        </div>
        <NewChatRoom v-if="isPopupVisible" @close="closeNewChatRoom"/>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import NewChatRoom from '@/views/chat/chat_components/NewChatRoom.vue';

  // 상태 관리
const isVisible = ref(true); // 팝업창 가시성 상태
const chatList = ref([]);   // 채팅방 목록
const searchQuery = ref(''); // 검색어 상태
const isPopupVisible = ref(false);

// 팝업 닫기
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

// 채팅방 데이터 가져오기
const fetchChatRooms = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/chat/room');
    chatList.value = response.data;
  } catch (error) {
    console.error('채팅방 목록을 가져오는 중 오류 발생:', error);
  }
};

// 채팅방 클릭 시 실행될 로직
const openChatRoom = (roomId) => {
  console.log(`${roomId}번 채팅방 열기`); // 실제 동작을 API와 연동 필요
};

// 검색 필터링
const searchChat = (event) => {
  searchQuery.value = event.target.value.toLowerCase();
};

// 컴포넌트가 로드될 때 데이터 가져오기
onMounted(() => {
  fetchChatRooms();
});

  </script>
  
  <style scoped>
  .popup {
    position: absolute;
    top: 50px; /* 아이콘 아래로 50px */
    left: 85%;
    transform: translateX(-50%);
    width: 40rem;
    height: 70%;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }
  
  /* 팝업 콘텐츠 */
  .popup-content {
    padding: 20px;
    overflow-y: auto; /* 내용이 길어지면 스크롤 */
  }
  
  .popup-content p {
    font-size: 2rem;
    font-weight: bold;
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
  font-size: 1.5rem;
  color: rgb(43, 43, 43);
  border: none;
  cursor: pointer;
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
    width: 100%;
  }
  </style>