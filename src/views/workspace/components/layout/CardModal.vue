// CardModal.vue
<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-content">
          <div 
            class="tag" 
            :style="{ backgroundColor: card.tag_color }"
          >
            {{ card.tag_name }}
          </div>
          <h2>{{ card.card_title }}</h2>
        </div>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="info-section">
          <h3>기간</h3>
          <p>{{ formatDate(card.start_time) }} - {{ formatDate(card.end_time) }}</p>
        </div>

        <div class="info-section">
          <h3>설명</h3>
          <p>{{ card.card_content }}</p>
        </div>

        <div class="info-section">
          <h3>담당자 정보</h3>
          <div class="user-info">
            <img 
              :src="card.assignee_profile_url" 
              :alt="card.assignee_name"
              class="avatar"
            >
            <div class="user-details">
              <p class="user-name">{{ card.assignee_name }}</p>
              <p class="user-email">{{ card.assignee_email }}</p>
              <p class="team-name">{{ card.assignee_team_name }}</p>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>생성자 정보</h3>
          <div class="user-info">
            <img 
              :src="card.creator_profile_url" 
              :alt="card.creator_name"
              class="avatar"
            >
            <div class="user-details">
              <p class="user-name">{{ card.creator_name }}</p>
              <p class="user-email">{{ card.creator_email }}</p>
              <p class="team-name">{{ card.creator_team_name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  // card: {
  //   type: Object,
  //   required: true
  // }
  // 수정 
  card: {
    type: Object,
    required: false,
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.header-content {
  flex: 1;
}

.header-content h2 {
  margin: 0.5rem 0 0 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  color: #666;
}

.close-button:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h3 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: white;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-details p {
  margin: 0.25rem 0;
}

.user-name {
  font-weight: bold;
}

.user-email {
  color: #666;
  font-size: 0.875rem;
}

.team-name {
  display: inline-block;
  background: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.5rem;
}
</style>
