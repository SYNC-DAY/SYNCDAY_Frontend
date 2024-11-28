<template>
  <div class="cardboard-view-container p-4">
    <Accordion class="cardboard-accordion">
      <AccordionPanel v-for="cardboard in cardboards" :key="cardboard.cardboard_id" :value="cardboard.value">
        <!-- Header Template -->

        <AccordionHeader>
          {{ cardboard.title }}
        </AccordionHeader>
        <AccordionContent v-for="card in cardboard.cards" :key="card.card_id" :value="card">
          <span>
            {{ card.card_title }}
          </span>
        </AccordionContent>



        <!-- Content Template -->
        <div class="card-grid gap-4">
          <div v-for="card in cardboard.cards" :key="card.card_id"
            class="card-item bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-3">
              <h3 class="font-medium text-lg">{{ card.title }}</h3>
              <span v-if="card.tag" class="px-2 py-1 text-xs rounded-full"
                :style="{ backgroundColor: card.tag.color + '20', color: card.tag.color }">
                {{ card.tag.tag_name }}
              </span>
            </div>

            <p class="text-gray-600 text-sm mb-4">{{ card.content }}</p>

            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <img v-if="card.assignee?.profile_photo" :src="card.assignee.profile_photo"
                  :alt="card.assignee.username" class="w-6 h-6 rounded-full" />
                <span class="text-sm text-gray-500">{{ card.assignee?.username || 'Unassigned' }}</span>
              </div>

              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span>{{ formatDate(card.end_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </AccordionPanel>
    </Accordion>
  </div>
</template>

<script setup>

import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

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