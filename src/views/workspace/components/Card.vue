// Card.vue (업데이트)
<template>
  <div class="card" @click="openModal">
    <div class="card-header">
      <div class="tag" :style="{ backgroundColor: card.tag_color }">
        {{ card.tag_name }}
      </div>
      <div class="dates">
        {{ formatDate(card.start_time) }} - {{ formatDate(card.end_time) }}
      </div>
    </div>
    <h4 class="card-title">{{ card.card_title }}</h4>
    <p class="card-content">{{ card.card_content }}</p>
    <div class="card-footer">
      <div class="assignee">
        <img :src="card.assignee_profile_url" :alt="card.assignee_name" class="avatar">
        <span>{{ card.assignee_name }}</span>
      </div>
      <div class="team">{{ card.assignee_team_name }}</div>
    </div>

    <CardModal :show="showModal" :card="card" @close="closeModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CardModal from './layout/CardModal.vue';
const props = defineProps({
  card: {
    type: Object,
    required: true
  }
});

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
};
</script>

// Card.vue
<style scoped>
.card {
  /* existing styles */
  min-width: 250px;
  max-width: 100%;
  overflow: hidden;
  /* Prevent content overflow */
}

.card-title {
  margin: 0.5rem 0;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  font-size: 0.875rem;
  color: #444;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>