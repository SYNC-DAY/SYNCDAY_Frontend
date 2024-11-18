<template>
  <div>
    <div v-if="isVisible" class="popup" :draggable="true">
      <button class="close-button" @click="closePopup">X</button>
      <div class="popup-content">
        <p>채팅</p>
        <div class="newchat">
          <button class="new-chat">새 채팅</button>
          </div>
          <div class= "chatlist">
            <ui>
              <li v-for="chat in chatlist" :key="chat.id" @click="openChatRoom(chat.id)" class="chat-room">
                <h4>{{ chat.name }}</h4>
                <p>{{ chat.lastMessage }}</p>
              </li>
            </ui>
          </div>
        </div>
      </div>

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const isVisible = ref(false);
const emit = defineEmits();
const chatlist = ref([]);


const closePopup = () => {
  emit('update:isVisible', false);
};

// 채팅방 오픈
const openChatRoom = (chatId) => {
  console.log(`Open chatRoom with ID: ${chatId}`);
};

// 백엔드에서 채팅방 목록 가져옴
const fetchChatList = async () => {
  try {
    const response = await fetch('api/chatroom');
    const data = await response.json();
    chatlist.value = data;  // 채팅방 목록 업데이트
  } catch (error){
    console.error("채팅방 연결 실패: ", error);
  }
};

onMounted(() => {
  fetchChatList();
});
</script>

<style scoped>
.popup {
  position: absolute;
  top: 50px; /* 아이콘 아래로 50px */
  right: 0%;
  transform: translateX(-50%);
  width: 30%;
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

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: #333;
}

.close-button:hover {
  color: #000000;
}

.new-chat {
  color: FF9D85;
}

.chatlist {
  margin-top: 20px;
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
  font-size: 14px;
  color: #666;
}
</style>