// CardBoardView.vue
<template>
  <div class="cardboard-view">
    <Board 
      v-for="cardboard in cardboards" 
      :key="cardboard.cardboard_id"
      :title="cardboard.title"
      :cards="cardboard.cards"
      :progress="cardboard.progress_status"
    ></Board>
  </div>
</template>

<script setup>
import Board from '../components/layout/Board.vue';

defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
.cardboard-view {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  overflow-x: auto;
  padding: 1rem;
}
</style>