<template>
  <div class="card">
    <DataTable v-model:expandedRows="expandedRows" :value="cardboards" dataKey="cardboard_id" @rowExpand="onRowExpand"
      @rowCollapse="onRowCollapse">
      <!-- Table Header with Expand/Collapse Controls -->
      <template #header>
        <div class="flex flex-wrap justify-end gap-2">
          <Button text icon="pi pi-plus" label="전체 확장" @click="expandAll" />
          <Button text icon="pi pi-minus" label="전체 축소" @click="collapseAll" />
        </div>
      </template>

      <!-- Expander Column -->
      <Column expander style="width: 5rem" />

      <!-- Cardboard Title & Progress -->
      <Column field="title" header="보드">
        <template #body="slotProps">
          <div class="flex flex-col gap-2">
            <span class="text-lg font-semibold">{{ slotProps.data.title }}</span>
            <ProgressBar :value="slotProps.data.progress_status" class="mt-2" />
            <span class="text-sm text-gray-600">진행률: {{ slotProps.data.progress_status }}%</span>
          </div>
        </template>
      </Column>

      <!-- Date Range -->
      <Column field="date_range" header="기간">
        <template #body="slotProps">
          <div class="flex flex-col">
            <span>{{ formatDate(slotProps.data.start_time) }}</span>
            <span>~ {{ formatDate(slotProps.data.end_time) }}</span>
          </div>
        </template>
      </Column>

      <!-- VCS Info -->
      <Column field="vcs_info" header="VCS 정보">
        <template #body="slotProps">
          <div v-if="slotProps.data.vcs_type" class="flex items-center gap-2">
            <i :class="getVCSIcon(slotProps.data.vcs_type)" />
            <a :href="slotProps.data.vcs_milestone_url" target="_blank" class="text-blue-600 hover:underline">
              마일스톤 보기
            </a>
          </div>
          <span v-else>-</span>
        </template>
      </Column>

      <!-- Expanded Row Template - Cards List -->
      <template #expansion="slotProps">
        <div class="p-4">
          <h5 class="mb-4">{{ slotProps.data.title }}의 카드 목록</h5>
          <DataTable :value="slotProps.data.cards">
            <Column field="title" header="제목"></Column>
            <Column field="content" header="내용">
              <template #body="cardProps">
                <div class="whitespace-pre-wrap">{{ cardProps.data.content }}</div>
              </template>
            </Column>
            <Column header="담당자">
              <template #body="cardProps">
                <div class="flex items-center gap-2">
                  <img :src="cardProps.data.assignee_profile_url || '/default-avatar.png'"
                    :alt="cardProps.data.assignee_name" class="w-8 h-8 rounded-full" />
                  <span>{{ cardProps.data.assignee_name }}</span>
                </div>
              </template>
            </Column>
            <Column field="tag_name" header="태그">
              <template #body="cardProps">
                <Tag v-if="cardProps.data.tag_name" :value="cardProps.data.tag_name"
                  :style="{ backgroundColor: cardProps.data.tag_color, color: getContrastColor(cardProps.data.tag_color) }" />
              </template>
            </Column>
            <Column field="end_time" header="마감일">
              <template #body="cardProps">
                <span>{{ formatDate(cardProps.data.end_time) }}</span>
              </template>
            </Column>
            <Column headerStyle="width:4rem">
              <template #body="cardProps">
                <Button icon="pi pi-search" @click="openCardDetails(cardProps.data)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
    <Toast />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';

const props = defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['cardClick']);

const expandedRows = ref({});
const toast = useToast();

// Expansion handling
const onRowExpand = (event) => {
  toast.add({
    severity: 'info',
    summary: '보드 확장됨',
    detail: event.data.title,
    life: 3000
  });
};

const onRowCollapse = (event) => {
  toast.add({
    severity: 'success',
    summary: '보드 축소됨',
    detail: event.data.title,
    life: 3000
  });
};

const expandAll = () => {
  expandedRows.value = props.cardboards.reduce((acc, p) => {
    acc[p.cardboard_id] = true;
    return acc;
  }, {});
};

const collapseAll = () => {
  expandedRows.value = null;
};

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getVCSIcon = (vcsType) => {
  switch (vcsType?.toLowerCase()) {
    case 'github':
      return 'pi pi-github';
    case 'gitlab':
      return 'pi pi-gitlab';
    default:
      return 'pi pi-code';
  }
};

const getContrastColor = (hexColor) => {
  if (!hexColor) return '#000000';

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const openCardDetails = (card) => {
  emit('cardClick', card);
};
</script>

<style scoped>
.card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.p-datatable) {
  border-radius: 0.5rem;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  transition: background-color 0.2s;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8fafc;
}

:deep(.p-progressbar) {
  height: 0.5rem !important;
  background: #e2e8f0;
}

:deep(.p-progressbar-value) {
  background: linear-gradient(90deg, #60a5fa, #3b82f6);
}

:deep(.p-tag) {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
}

.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>