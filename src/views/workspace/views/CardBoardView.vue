<template>
  <div class="cardboard-view-container p-4">
    <Accordion class="cardboard-accordion" v-model:activeIndex="activePanel">
      <AccordionPanel v-for="(cardboard, index) in cardboards" :key="index" :value="index">
        <AccordionHeader>
          {{ cardboard.title }}
        </AccordionHeader>

        <AccordionContent v-for="card in cardboard.cards" :key="card.card_id">
          <Card :card="card"></Card>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>

import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

import Card from '../components/Card.vue';


const props = defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};
</script>

<style scoped>
.cardboard-view-container :deep(.p-accordion) {
  width: 100%;
}

.cardboard-view-container :deep(.p-accordion-header-link) {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
}

.cardboard-view-container :deep(.p-accordion-content) {
  background-color: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  border-top: none !important;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  padding: 1rem;
}

.card-item {
  border: 1px solid #e2e8f0;
}

.progress-bar {
  background-color: #e2e8f0;
}
</style>