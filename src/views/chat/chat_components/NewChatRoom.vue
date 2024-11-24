<template>
  <div class="modal" draggable="true">
    <div class="modal-content">
      <button class="close-button" @click="$emit('close')">X</button>
      <h2>새 채팅방 생성</h2>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.modal {
  position: absolute;
  top: 30%;
  left: 85%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  width: 35rem;
  height: 50rem;
}

.modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-content h2 {
  font-size: 2rem;
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
</style>
