// CardBoardView.vue
<template>
  <div class="cardboard-view-container">
    <!-- <Board v-for="cardboard in cardboards" :key="cardboard.cardboard_id" :title="cardboard.title"
      :cards="cardboard.cards" :progress="cardboard.progress_status"></Board> -->
  </div>
</template>

<script setup>
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

// import Board from '../components/layout/Board.vue';

defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
.cardboard-view-container {}
</style>