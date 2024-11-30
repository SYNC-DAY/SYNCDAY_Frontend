<template>
  <div class="cardboard-container p-4">
    <DataTable :expandedRows="computedExpandedRows" @update:expandedRows="updateExpandedRows" :value="cardboards"
      dataKey="cardboard_id" class="shadow-sm rounded-lg" :rowHover="true" responsiveLayout="scroll"
      columnResizeMode="fit" @rowClick="onRowClick" :selectionMode="null">
      <template #header>
        <div class="flex justify-between items-center mb-4">
          <div class="container-row justify-right">
            <Button text icon="pi pi-plus" label="전체 펼치기" severity="contrast" @click="expandAll" />
            <Button text icon="pi pi-minus" label="전체 접기" severity="contrast" @click="collapseAll" />
            <Button icon="pi pi-plus" label="New" outlined style="margin-right:1rem"></Button>
          </div>
        </div>
      </template>

      <Column field="title" header="이름" sortable>
        <template #body="slotProps">
          <div class="font-medium">{{ slotProps.data.title }}</div>
        </template>
      </Column>
      <Column field="progress_status" header="진척도" sortable style="width: 10rem">
        <template #body="slotProps">
          <div class="flex items-center gap-2">
            <ProgressBar :value="slotProps.data.progress_status" class="w-32" :class="{
              'bg-red-100': slotProps.data.progress_status < 30,
              'bg-yellow-100': slotProps.data.progress_status >= 30 && slotProps.data.progress_status < 70,
              'bg-green-100': slotProps.data.progress_status >= 70
            }" />
          </div>
        </template>
      </Column>
      <Column field="start_time" header="시작일" sortable>
        <template #body="slotProps">
          <div class="text-gray-600">{{ formatDate(slotProps.data.start_time) }}</div>
        </template>
      </Column>
      <Column field="end_time" header="종료일" sortable>
        <template #body="slotProps">
          <div class="text-gray-600">{{ formatDate(slotProps.data.end_time) }}</div>
        </template>
      </Column>
      <Column field="vcs_milestone_url" header="VCS" style="width: 100px">
        <template #body="slotProps">
          <Button v-if="slotProps.data.vcs_milestone_url" icon="pi pi-external-link" text
            @click.stop="openVcsLink(slotProps.data.vcs_milestone_url)" />
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="bg-gray-50 rounded-lg">
          <DataTable :value="slotProps.data.cards" class="bg-white shadow-sm" :rowHover="true"
            @rowClick="(event) => onCardClick(event.data)" columnResizeMode="fit">
            <Column field="card_title" header="제목" sortable>
              <template #body="cardProps">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: cardProps.data.tag_color }" />
                  <span>{{ cardProps.data.card_title }}</span>
                </div>
              </template>
            </Column>
            <Column field="assignee_name" header="담당자" sortable>
              <template #body="cardProps">
                <div class="flex items-center gap-2">
                  <Avatar :src="cardProps.data.assignee_profile_url" class="w-6 h-6 rounded-full"
                    :alt="cardProps.data.assignee_name" shape="circle" />
                  <span>{{ cardProps.data.assignee_name }}</span>
                </div>
              </template>
            </Column>
            <Column field="tag_name" header="태그" sortable>
              <template #body="cardProps">
                <span class="px-2 py-1 rounded-full text-xs" :style="{
                  backgroundColor: `${cardProps.data.tag_color}20`,
                  color: cardProps.data.tag_color
                }">
                  {{ cardProps.data.tag_name }}
                </span>
              </template>
            </Column>
            <Column field="start_time" header="시작일" sortable>
              <template #body="cardProps">
                <div class="text-gray-600">{{ formatDate(cardProps.data.start_time) }}</div>
              </template>
            </Column>
            <Column field="end_time" header="종료일" sortable>
              <template #body="cardProps">
                <div class="text-gray-600">{{ formatDate(cardProps.data.end_time) }}</div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
  <CardModal :show="showCardModal" :card="selectedCard" @close="closeCardModal" />
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import CardModal from '../components/layout/CardModal.vue';
const props = defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['cardClick', 'addBoard', 'rowExpand', 'rowCollapse']);

const expandedRowsMap = ref(new Map());

const computedExpandedRows = computed(() => {
  const result = {};
  expandedRowsMap.value.forEach((value, key) => {
    result[key] = value;
  });
  return result;
});

const updateExpandedRows = (newExpandedRows) => {
  Object.entries(newExpandedRows).forEach(([key, value]) => {
    expandedRowsMap.value.set(key, value);
  });
};

const expandAll = () => {
  props.cardboards.forEach(cardboard => {
    expandedRowsMap.value.set(cardboard.cardboard_id, true);
  });
};

const collapseAll = () => {
  expandedRowsMap.value.clear();
};

const onRowClick = (event) => {
  const clickedCardboardId = event.data.cardboard_id;

  if (expandedRowsMap.value.get(clickedCardboardId)) {
    expandedRowsMap.value.delete(clickedCardboardId);
    emit('rowCollapse', event.data);
  } else {
    expandedRowsMap.value.set(clickedCardboardId, true);
    emit('rowExpand', event.data);
  }
};



const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const openVcsLink = (url) => {
  if (url) {
    window.open(url, '_blank');
  }
};

const showCardModal = ref(false);
const selectedCard = ref(null);

const onCardClick = (cardData) => {
  console.log(cardData)
  selectedCard.value = cardData;
  showCardModal.value = true;
};

// Modal close handler
const closeCardModal = () => {
  showCardModal.value = false;
  selectedCard.value = null;
};
</script>