<template>
  <div class="ph-1rem container-col width-100">
    <div v-if="isLoading" class="loading-state">
      Loading...
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchWorkspace" class="retry-button">
        Retry
      </button>
    </div>

    <template v-else-if="workspaceDetails">
      <div class="workspace-header container-row underline-gray">
        <div class="container-row header-left">
          <h4>{{ workspaceDetails.workspace_name }}</h4>
          <i class="pi pi-github"></i>
        </div>

        <div class="container-row header-right">

          <Button icon="pi pi-cog" severity="secondary"></Button>
          <Button icon="pi pi-tag"></Button>
        </div>
      </div>

      <!-- select view mode -->
      <div>
        <Tabs value="0">
          <TabList>
            <Tab value="0">CardBoard</Tab>
            <Tab value="1">Kanban</Tab>
            <Tab value="2">Calendar</Tab>
          </TabList>

          <TabPanels>
            <TabPanel value="0">
              <CardBoard :cardboards="workspaceDetails.cardboards || [] " :workspaceId="workspaceDetails.workspace_id"></CardBoard>
            </TabPanel>
            <TabPanel value="1">
              <KanbanBoard :cardboards="workspaceDetails.cardboards || []" />

            </TabPanel>
            <TabPanel value="2">
              <CalendarView :cardboards="workspaceDetails.cardboards" />

            </TabPanel>
            <!-- Calendar view -->
          </TabPanels>
        </Tabs>
        <CardModal v-if="showCardModal" :show="showCardModal" :card="selectedCard" @close="handleCloseModal" />
      </div>

    </template>

    <div v-else class="empty-state">
      No workspace data available
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

/* views */
import CardBoard from './views/CardBoardView.vue';
import KanbanBoard from './views/KanbanBoardView.vue';
import CalendarView from './views/CalendarView.vue';
import CardModal from './components/layout/CardModal.vue';


const route = useRoute();
const router = useRouter();
const showCardModal = ref(false);
const selectedCard = ref(null);

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  },
  workspaceId: {
    type: [String, Number],
    required: true
  },
  projects: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:projects']);
const isLoading = ref(false);
const error = ref(null);
const workspaceDetails = ref(null);

const fetchWorkspace = async () => {
  if (!props.workspaceId) {
    error.value = 'No workspace ID provided';
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`/workspaces/${props.workspaceId}`);

    if (response.data.success) {
      workspaceDetails.value = response.data.data;
      const updatedProjects = JSON.parse(JSON.stringify(props.projects));
      const project = updatedProjects.find(p => p.proj_id === parseInt(props.projectId));

      if (project) {
        const workspace = project.workspaces.find(
          w => w.workspace_id === parseInt(props.workspaceId)
        );
        if (workspace) {
          Object.assign(workspace, {
            workspace_name: workspaceDetails.value.workspace_name,
            progress_status: workspaceDetails.value.progress_status,
            bookmark_status: workspaceDetails.value.bookmark_status,
          });

          emit('update:projects', updatedProjects);
        }
      }
    } else {
      throw new Error(response.data.error || 'Failed to fetch workspace data');
    }
  } catch (err) {
    error.value = err.message || 'Failed to load workspace';
    console.error('Failed to fetch workspace:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchWorkspace();
});

const handleCloseModal = () => {
  router.replace({ 
    query: { 
      ...route.query,
      cardId: undefined 
    }
  });
};

watch(
  [
    () => props.workspaceId, 
    () => props.projectId,
    () => route.query.cardId
  ],
  async ([newWorkspaceId, newProjectId, newCardId], [oldWorkspaceId, oldProjectId, oldCardId]) => {
    // 워크스페이스나 프로젝트가 변경되었을 때
    if ((newWorkspaceId && newWorkspaceId !== oldWorkspaceId) ||
        (newProjectId && newProjectId !== oldProjectId)) {
      await fetchWorkspace();
    }

    // cardId가 변경되었을 때
    if (newCardId !== oldCardId) {
      if (newCardId) {
        // 워크스페이스 데이터가 없다면 먼저 로드
        if (!workspaceDetails.value) {
          await fetchWorkspace();
        }
        
        // 카드 데이터 찾기
        const card = findCardInWorkspace(newCardId);
        if (card) {
          selectedCard.value = card;
          showCardModal.value = true;
        }
      } else {
        // cardId가 없어졌을 때 (모달 닫기)
        showCardModal.value = false;
        selectedCard.value = null;
      }
    }
  }
);

// 워크스페이스 내에서 카드 찾기 헬퍼 함수
const findCardInWorkspace = (cardId) => {
  if (!workspaceDetails.value?.cardboards) return null;
  
  for (const cardboard of workspaceDetails.value.cardboards) {
    const card = cardboard.cards?.find(c => c.card_id === Number(cardId));
    if (card) return card;
  }
  return null;
};
</script>
<style scoped>
.workspace-header {
  padding: 0 2rem;
}

.workspace-header h4 {
  font-size: 1.4rem;
}

.workspace-header>h3 {
  font-size: 2rem;
}

.workspace-content {}

.boards-container {
  height: 100%;
  padding: 1rem;
  overflow-x: auto;
  display: flex;
  gap: 1rem;
}

/* Add custom scrollbar styling */
.boards-container::-webkit-scrollbar {
  height: 6px;
}

.boards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.boards-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.boards-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>