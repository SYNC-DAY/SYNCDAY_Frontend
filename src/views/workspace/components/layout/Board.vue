// Board.vue
<template>

</template>

<script setup>

import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';


import Card from '../CardItem.vue';

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