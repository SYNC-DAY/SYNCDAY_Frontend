<template>
  <div class="cardboard-container">
    <DataTable v-model:expandedRows="expandedRows" :value="cardboards" dataKey="cardboard_id" @rowExpand="onRowExpand"
      @rowCollapse="onRowCollapse" tableStyle="">
      <template #header>
        <div class="flex flex-wrap justify-end gap-2">
          <Button text icon="pi pi-plus" label="Expand All" @click="expandAll" />
          <Button text icon="pi pi-minus" label="Collapse All" @click="collapseAll" />
        </div>
      </template>
      <Column expander style="width:5rem" />
      <Column field="title" header="이름" sortable />
      <Column field="progress_status" header="진척도" sortable>
        <template #body="slotProps">
          <ProgressBar :value="slotProps.data.progress_status" />
        </template>
      </Column>
      <Column field="start_time" header="시작" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.start_time) }}
        </template>
      </Column>
      <Column field="end_time" header="끝" sortable>
        <template #body="slotProps">
          {{ formatDate(slotProps.data.end_time) }}
        </template>
      </Column>
      <Column field="vcs_milestone_url" header="VCS">
        <template #body="slotProps">
          Link
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="">
          <DataTable :value="slotProps.data.cards">
            <Column field="card_title" header="제목" sortable></Column>
            <Column field="start_time" header="시작" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.start_time) }}
              </template>
            </Column>

            <Column field="end_time" header="끝" sortable>
              <template #body="slotProps">
                {{ formatDate(slotProps.end_time) }}
              </template>
            </Column>
            <Column field="assignee" header="담당자" sortable></Column>
            <Column field="tag" header="태그" sortable></Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';

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

// State
const expandedRows = ref({});

// Methods
const expandAll = () => {
  const expanded = {};
  props.cardboards.forEach(cardboard => {
    expanded[cardboard.cardboard_id] = true;
  });
  expandedRows.value = expanded;
};

const collapseAll = () => {
  expandedRows.value = {};
};

const onRowExpand = (event) => {
  expandedRows.value[event.cardboard_id] = true;
  // Force reactivity update since we're modifying an object property
  expandedRows.value = { ...expandedRows.value };
  emit('rowExpand', event.data);
};

const onRowCollapse = (event) => {
  expandedRows.value[event.cardboard_id] = false;
  // Force reactivity update since we're modifying an object property
  expandedRows.value = { ...expandedRows.value };
  emit('rowCollapse', event.data);
};
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};
</script>