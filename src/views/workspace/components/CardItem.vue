// Card.vue (업데이트)
<template>
  <Card @click="openModal">
    <template #content>
      <div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
      <div class="card-content">
        <span> {{ card.card_title }}</span>
      </div>
    </template>

  </Card>


  <CardModal :show="showModal" :card="card" @close="closeModal" />
</template>

<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';



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
.card-item {
  cursor: pointer;
}



.card-item:last-child {
  margin-bottom: 0;
}

.card-container {
  display: flex;
  gap: 0.75rem;
}

.tag-indicator {
  width: 4px;
  height: auto;
  border-radius: 2px;
}

.p-card {
  margin-top: 1rem;
}

.card-content {
  flex: 1;
}

.card-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.9rem;
  color: #666;
}

/* Override PrimeVue Card styles */
:deep(.p-card) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.p-card-content) {
  padding: 1rem;
}
</style>