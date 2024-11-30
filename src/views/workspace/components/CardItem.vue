// Card.vue (업데이트)
<template>
  <Card @click="openModal">
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
<style scoped></style>