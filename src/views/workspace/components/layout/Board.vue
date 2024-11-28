// Board.vue
<template>

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
.board {}
</style>