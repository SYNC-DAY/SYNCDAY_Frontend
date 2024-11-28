// Card.vue (업데이트)
<template>
  <Card>
    <template #titlie>{{ card.card_title }}</template>
    <template #content> {{ card.card_content }} </template>
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