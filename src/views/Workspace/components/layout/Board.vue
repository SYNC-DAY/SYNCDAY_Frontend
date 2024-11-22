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
      <Card 
        v-for="card in cards" 
        :key="card.card_id"
        :card="card"
      ></Card>
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

<style scoped>
.board {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
}

.board-header {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 0.5rem 0;
}

.progress {
  height: 100%;
  background: #4CAF50;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #666;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>