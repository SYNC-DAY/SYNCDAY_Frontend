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
          <Button icon="pi pi-code" text @click.stop="showModal = true" v-tooltip="'Repository Settings'"></Button>
        </div>

        <div class="container-row header-right">

          <Button icon="pi pi-cog" severity="secondary"></Button>
          <Button icon="pi pi-tag" @click="showTagDialog"></Button>
          <!-- 태그 관리 Dialog -->
          <Dialog v-model:visible="showTagDialog" header="태그 관리" :style="{ width: '30rem' }" modal>
            <!-- 태그 선택 -->
            <div class="field mb-4">
              <label for="tags">태그 선택:</label>
              <MultiSelect id="tags" v-model="selectedTags" :options="tags" optionLabel="name" placeholder="태그를 선택하세요"
                class="w-full" />
            </div>
          </Dialog>
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
              <CardBoard :cardboards="workspaceDetails.cardboards || []" :workspaceId="workspaceDetails.workspace_id">
              </CardBoard>
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
  <RepoSettingModal v-model="showModal" :project-id="projectId" :workspace-id="workspaceId"
    :githubInstallationId="githubInstallationId" />
</template>

<script setup>
  import { ref, onMounted, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';

  import Tabs from 'primevue/tabs';
  import TabList from 'primevue/tablist';
  import Tab from 'primevue/tab';
  import { useToast } from "primevue/usetoast";
  import TabPanels from 'primevue/tabpanels';
  import TabPanel from 'primevue/tabpanel';

  /* views */
  import CardBoard from './views/CardBoardView.vue';
  import KanbanBoard from './views/KanbanBoardView.vue';
  import CalendarView from './views/CalendarView.vue';
  import CardModal from './components/layout/CardModal.vue';

  import WorkspaceAPI from '@/api/proj/workspace';
  import RepoSettingModal from './components/RepoSettingModal.vue';
  import { useProjectStore } from '@/stores/proj/useProjectStore';
  import GithubAppInstallationModal from '../vcs/github/GithubAppInstallationModal.vue';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const showCardModal = ref(false);
  const selectedCard = ref(null);
  const showTagDialog = ref(false); // 태그 관리 다이얼로그 표시 여부
  const selectedTags = ref([]); // 선택된 태그
  const newTagName = ref(""); // 새 태그 이름 입력
  const projectStore = useProjectStore();
  const githubInstallationId = ref(null);
  const showModal = ref(false)
  const props = defineProps({
    projectId: {
      type: [String, Number],
      required: true
    },
    workspaceId: {
      type: [String, Number],
      required: true
    },

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
      workspaceDetails.value = await WorkspaceAPI.getWorkspaceById(props.workspaceId)
    } catch (err) {
      console.error(err)
    } finally {
      isLoading.value = false
    }
  }
  const fetchInstallationId = async () => {
    try {
      const id = await projectStore.getInstallationId(props.projectId);
      console.log(props.projectId)
      console.log(id)
      githubInstallationId.value = id;
      return id;
    } catch (err) {
      throw new Error(err)
    }
  }


  onMounted(() => {
    fetchWorkspace();
    fetchInstallationId(props.projectId)
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