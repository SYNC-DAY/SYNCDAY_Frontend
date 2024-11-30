<template>
  <div class="cardboard-container container-col">
    <!-- Control Panel -->
    <section class="control-panel container-row">
      <div class="container-row">
        <div class="flex gap-2">
          <Dropdown v-model="selectedFilter" :options="filterOptions" optionLabel="label" placeholder="상태 필터"
            class="w-48" />
          <Dropdown v-model="selectedSort" :options="sortOptions" optionLabel="label" placeholder="정렬 기준"
            class="w-48" />
        </div>
        <Button icon="pi pi-plus" label="새 보드" severity="success" @click="$emit('addBoard')" />
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <ProgressSpinner />
    </div>

    <!-- Empty State -->
    <section v-else-if="cardboardsLength == 0" class="empty-state">
      <div class="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <i class="pi pi-folder-open text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-600 mb-2">보드가 없습니다</h3>
        <p class="text-sm text-gray-500 mb-4">새 보드를 생성하여 작업을 시작해보세요</p>
        <Button label="새 보드 만들기" icon="pi pi-plus" severity="success" @click="$emit('addBoard')" />
      </div>
    </section>

    <!-- Board List -->
    <DataTable v-else v-model:expandedRows="expandedRows" :value="filteredCardboards" dataKey="cardboard_id"
      :paginator="true" :rows="5" :rowsPerPageOptions="[5, 10, 20]" tableStyle="min-width: 20rem"
      @rowExpand="onRowExpand" @rowCollapse="onRowCollapse" class="shadow-sm">
      <!-- Expander Column -->
      <Column expander style="width: 3rem" />

      <!-- Board Info Column -->
      <Column header="보드 정보" class="container-row">
        <template #body="{ data }">
          <div class="board-info">
            <div class="container-row">
              <h4 class="">{{ data.title }}</h4>
              <Tag :value="getStatusText(data.progress_status)" :severity="getStatusSeverity(data.progress_status)" />
            </div>
            <ProgressBar :value="data.progress_status" class="h-2 mb-2"
              :class="getProgressBarClass(data.progress_status)" />
            <div class="text-sm text-gray-600 flex">
              <span class="container-row">
                <i class="pi pi-calendar" />
                {{ formatDateRange(data.start_time, data.end_time) }}
              </span>
              <span class="flex items-center gap-1">
                <i class="pi pi-check-circle" />
                {{ data.cards?.length || 0 }}개의 카드
              </span>
              <span class="flex items-center gap-1" :class="getDueDateClass(data)">
                <i class="pi pi-clock" />
                {{ getDueDateText(data.end_time) }}
              </span>
            </div>
          </div>
        </template>
      </Column>

      <!-- Assignee Column -->
      <Column header="담당자" class="w-1/4">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-2">
            <div v-for="user in getUniqueAssignees(data.cards)" :key="user.id"
              class="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors">
              <Avatar :image="user.profileUrl" :label="getInitials(user.name)" size="small" shape="circle"
                class="w-6 h-6" />
              <span class="text-sm">{{ user.name }}</span>
            </div>
          </div>
        </template>
      </Column>

      <!-- Progress Column -->
      <Column header="작업 현황" class="w-1/4">
        <template #body="{ data }">
          <div class="flex flex-col gap-1">
            <div class="flex justify-between text-sm">
              <span>완료</span>
              <span>{{ getCompletedCards(data.cards) }}/{{ data.cards?.length }}</span>
            </div>
            <div class="flex gap-0.5 h-2 rounded overflow-hidden">
              <div v-for="status in ['TODO', 'IN_PROGRESS', 'DONE']" :key="status"
                class="h-full transition-all duration-300" :class="getStatusBarClass(status)"
                :style="{ width: `${getStatusPercentage(data.cards, status)}%` }" />
            </div>
          </div>
        </template>
      </Column>

      <!-- Expanded Card List -->
      <template #expansion="{ data }">
        <div class="card-list p-4 bg-gray-50">
          <DataTable :value="data.cards" :paginator="true" :rows="5" class="bg-white shadow-sm" dataKey="card_id"
            responsiveLayout="scroll">
            <Column field="title" header="제목">
              <template #body="{ data: card }">
                <div class="flex items-center gap-2">
                  <Tag v-if="card.tag_name" :value="card.tag_name" :style="{
                    backgroundColor: validateHexColor(card.tag_color),
                    color: getContrastColor(card.tag_color)
                  }" />
                  <span>{{ card.title }}</span>
                </div>
              </template>
            </Column>
            <Column field="assignee_name" header="담당자">
              <template #body="{ data: card }">
                <div class="flex items-center gap-2">
                  <Avatar :image="card.assignee_profile_url" :label="getInitials(card.assignee_name)" size="small"
                    shape="circle" />
                  <span>{{ card.assignee_name }}</span>
                </div>
              </template>
            </Column>
            <Column field="end_time" header="마감일">
              <template #body="{ data: card }">
                <div class="flex items-center gap-2">
                  <i class="pi pi-calendar" />
                  <span>{{ formatDate(card.end_time) }}</span>
                </div>
              </template>
            </Column>
            <Column style="width: 4rem">
              <template #body="{ data: card }">
                <Button icon="pi pi-eye" text rounded @click="$emit('cardClick', card)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import ProgressBar from 'primevue/progressbar';
import Tag from 'primevue/tag';
import Dropdown from 'primevue/dropdown';
import Avatar from 'primevue/avatar';
import ProgressSpinner from 'primevue/progressspinner';

const debug = {
  log: (component, message, data) => {
    console.log(`[${component}]`, message, data ? data : '');
  },
  warn: (component, message, data) => {
    console.warn(`[${component}]`, message, data ? data : '');
  },
  error: (component, message, error) => {
    console.error(`[${component}]`, message, error);
  }
};


// Props and Emits
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
const selectedFilter = ref(null);
const selectedSort = ref(null);

// Options
const filterOptions = [
  { label: '전체', value: 'ALL' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
  { label: '지연', value: 'DELAYED' }
];

const sortOptions = [
  { label: '생성일순', value: 'CREATED' },
  { label: '마감일순', value: 'DUE_DATE' },
  { label: '진행률순', value: 'PROGRESS' }
];

// Computed
const filteredCardboards = computed(() => {
  let filtered = [...props.cardboards];

  // Filter
  if (selectedFilter.value && selectedFilter.value !== 'ALL') {
    filtered = filtered.filter(board => {
      const now = new Date();
      switch (selectedFilter.value) {
        case 'IN_PROGRESS':
          return board.progress_status > 0 && board.progress_status < 100;
        case 'COMPLETED':
          return board.progress_status === 100;
        case 'DELAYED':
          return new Date(board.end_time) < now && board.progress_status < 100;
        default:
          return true;
      }
    });
  }

  // Sort
  if (selectedSort.value) {
    filtered.sort((a, b) => {
      switch (selectedSort.value) {
        case 'DUE_DATE':
          return new Date(a.end_time) - new Date(b.end_time);
        case 'PROGRESS':
          return b.progress_status - a.progress_status;
        case 'CREATED':
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });
  }

  return filtered;
});

// Methods
const validateHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color) ? color : '#808080';
};

const getContrastColor = (hexColor) => {
  const validColor = validateHexColor(hexColor);
  const r = parseInt(validColor.slice(1, 3), 16);
  const g = parseInt(validColor.slice(3, 5), 16);
  const b = parseInt(validColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
};

const formatDateRange = (start, end) => {
  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

const getStatusText = (progress) => {
  if (!progress && progress !== 0) return '상태 없음';
  if (progress === 100) return '완료';
  if (progress > 70) return '마무리 단계';
  if (progress > 30) return '진행중';
  return '시작';
};

const getStatusSeverity = (progress) => {
  if (!progress && progress !== 0) return null;
  if (progress === 100) return 'success';
  if (progress > 70) return 'info';
  if (progress > 30) return 'warning';
  return 'danger';
};

const getProgressBarClass = (progress) => {
  if (progress === 100) return 'bg-green-500';
  if (progress > 70) return 'bg-blue-500';
  if (progress > 30) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getStatusBarClass = (status) => {
  switch (status) {
    case 'TODO':
      return 'bg-gray-300';
    case 'IN_PROGRESS':
      return 'bg-blue-400';
    case 'DONE':
      return 'bg-green-400';
    default:
      return 'bg-gray-200';
  }
};

const getStatusPercentage = (cards, status) => {
  if (!cards?.length) return 0;
  const statusCount = cards.filter(card => card.status === status).length;
  return (statusCount / cards.length) * 100;
};

const getCompletedCards = (cards) => {
  if (!cards?.length) return 0;
  return cards.filter(card => card.status === 'DONE').length;
};

const getUniqueAssignees = (cards) => {
  if (!cards?.length) return [];
  const uniqueAssignees = new Map();
  cards.forEach(card => {
    if (card.assignee_id) {
      uniqueAssignees.set(card.assignee_id, {
        id: card.assignee_id,
        name: card.assignee_name,
        profileUrl: card.assignee_profile_url
      });
    }
  });
  return Array.from(uniqueAssignees.values());
};

const getInitials = (name) => {
  return name
    ? name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
    : '?';
};

const getDueDateText = (endTime) => {
  if (!endTime) return '마감일 없음';

  const end = new Date(endTime);
  const now = new Date();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}일 지연`;
  if (diffDays === 0) return '오늘 마감';
  return `${diffDays}일 남음`;
};
// 이전 코드에서 getDueDateClass 부분부터 이어서 작성합니다

const getDueDateClass = (board) => {
  if (!board.end_time) return 'text-gray-500';

  const end = new Date(board.end_time);
  const now = new Date();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-red-500';
  if (diffDays <= 3) return 'text-yellow-500';
  return 'text-green-500';
};

// Event Handlers
const onRowExpand = (event) => {
  emit('rowExpand', event.data);
};

const onRowCollapse = (event) => {
  emit('rowCollapse', event.data);
};

// Lifecycle hooks
onMounted(() => {
  debug.log('CardBoardView', 'Component mounted', {
    cardboardsLength: props.cardboards.length,
    loading: props.loading
  });
});

watch(() => props.cardboards, (newVal, oldVal) => {
  debug.log('CardBoardView', 'Cardboards updated', {
    oldLength: oldVal.length,
    newLength: newVal.length,
    isEmpty: newVal.length === 0
  });
}, { deep: true });

watch(() => props.loading, (newVal, oldVal) => {
  debug.log('CardBoardView', 'Loading state changed', {
    from: oldVal,
    to: newVal
  });
});
watch([selectedFilter, selectedSort], ([newFilter, newSort], [oldFilter, oldSort]) => {
  debug.log('CardBoardView', 'Filter/Sort changed', {
    filter: { old: oldFilter, new: newFilter },
    sort: { old: oldSort, new: newSort }
  });
});
</script>
<!-- 
<style scoped>
.cardboard-container {
  @apply p-4 bg-white rounded-lg w-full max-w-full overflow-x-auto;
}

.control-panel {
  @apply bg-gray-50 p-4 rounded-lg shadow-sm transition-all duration-200;
}

.control-panel:hover {
  @apply shadow-md;
}

/* DataTable Customization */
:deep(.p-datatable) {
  @apply rounded-lg overflow-hidden;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  @apply bg-gray-50 text-gray-700 font-semibold;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  @apply transition-colors duration-200;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  @apply bg-gray-50;
}

/* ProgressBar Customization */
:deep(.p-progressbar) {
  @apply bg-gray-200 overflow-hidden;
}

:deep(.p-progressbar-value) {
  @apply transition-all duration-300;
}

/* Tag Customization */
:deep(.p-tag) {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

/* Board Info Section */
.board-info {
  @apply p-2 rounded-lg transition-all duration-200;
}

.board-info:hover {
  @apply bg-gray-50;
}

/* Avatar Customization */
:deep(.p-avatar.p-avatar-sm) {
  @apply w-6 h-6 text-xs;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cardboard-container {
    @apply p-2;
  }

  .control-panel {
    @apply flex-col gap-2;
  }

  :deep(.p-datatable) {
    @apply text-sm;
  }

  .board-info {
    @apply flex-col;
  }
}

/* Animation Classes */
.fade-enter-active,
.fade-leave-active {
  @apply transition-opacity duration-300;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0;
}

.slide-enter-active,
.slide-leave-active {
  @apply transition-all duration-300;
}

.slide-enter-from,
.slide-leave-to {
  @apply transform translate-y-4 opacity-0;
}
</style> -->