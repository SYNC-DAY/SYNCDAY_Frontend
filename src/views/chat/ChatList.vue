<template>
  <div>
    <div v-if="isPopupVisible" class="popup" :draggable="true">
      <button class="close-button" @click="closePopup">X</button>
      <div class="popup-content">
        <p>채팅</p>
        <div class="newchat">
          <button class="new-chat">새 채팅</button>
          </div>
        </div>
      </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const isPopupVisible = ref(false);


const closePopup = () => {
  emit('close');
};
</script>

<style scoped>
.popup {
  position: absolute;
  top: 50px; /* 아이콘 아래로 50px */
  left: 50%; /* 중앙 정렬 */
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

/* 닫기 버튼 스타일 */
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
  color: #000000; /* 닫기 버튼 호버 효과 */
}
</style>