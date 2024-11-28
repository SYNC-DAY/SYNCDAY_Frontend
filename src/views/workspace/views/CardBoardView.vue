<template>
  <div class="cardboard-view-container p-4">
    <Accordion class="cardboard-accordion" multiple>
      <AccordionPanel v-for="(cardboard, index) in cardboards" :key="index" :value="index">
        <AccordionHeader>
          <div class="cardboard-header w-full px-6 py-4 flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <h3>{{ cardboard.title }}</h3>
              <span class=""></span>
            </div>
            <div>
              <ProgressBar :value="cardboard.progress_status" style="height: 1rem" />
            </div>

          </div>
        </AccordionHeader>

        <AccordionContent v-for="card in cardboard.cards" :key="card.card_id">
          <CardItem :card="card"></CardItem>
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
import ProgressBar from 'primevue/progressbar';

import CardItem from '../components/CardItem.vue';


const props = defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  }
});


</script>

<style>
.cardboard-view-container :deep(.p-accordion) {
  width: 100%;
}

.cardboard-view-container :deep(.p-accordion-header-link) {
  background-color: white !important;
  border: none !important;
  border-radius: 0.75rem !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.3s ease !important;
  padding: 0 !important;
  margin-bottom: 1rem !important;
}

.cardboard-view-container :deep(.p-accordion-header-link:hover) {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

.cardboard-view-container :deep(.p-accordion-header-link:focus) {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
  outline: none;
}

.cardboard-view-container :deep(.p-accordion-content) {
  background-color: #f8fafc !important;
  border: none !important;
  border-radius: 0.75rem !important;
  margin-bottom: 1rem !important;
  padding: 1rem !important;
}

.cardboard-header {
  width: 100%;
}

.progress-badge {
  background-color: #e0f2fe;
  color: #0369a1;
  font-weight: 500;
}

.progress-container {
  background-color: #e2e8f0;
}

.progress-bar {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
  transition: width 0.3s ease;
}
</style>