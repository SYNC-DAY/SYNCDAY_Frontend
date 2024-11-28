// Board.vue
<template>
  <div class="board">
    <div class="board-header">
      <h3>{{ title }}</h3>
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
      <span class="progress-text">{{ progress }}%</span>
    </div>
    <div class="cards-container">
      <Card v-for="card in cards" :key="card.card_id" :card="card"></Card>
    </div>
  </div>
</template>

<script setup>
import Card from '../Card.vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  cards: {
    type: Array,
    required: true,
    default: () => []
  },
  progress: {
    type: Number,
    required: true,
    default: 0
  }
});
</script>

// Board.vue
<style scoped>
.board {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  min-width: 280px;
  max-width: 100%;
  height: fit-content;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 0.5rem;
  /* Add space for scrollbar */
}

/* Add custom scrollbar styling */
.cards-container::-webkit-scrollbar {
  width: 6px;
}

.cards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.cards-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.cards-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>