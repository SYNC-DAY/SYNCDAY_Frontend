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
          <Button icon="pi pi-tag" @click="showTagDialog = true"></Button>
          <!-- 태그 관리 Dialog -->
          <Dialog v-model:visible="showTagDialog" header="태그 관리" :style="{ width: '30rem' }" modal>
            <div class="header-row">
              <Button icon="pi pi-plus" @click="openAddTagDialog" />
              <!-- <Button label="삭제" icon="pi pi-trash" class="p-button-danger" @click="deleteTag" /> -->
              <Dialog v-model:visible="addCardTag" header="새 태그 추가" :style="{ width: '30rem' }" modal>

                <div class="add-tag-form">
                  <span>태그 이름 입력: </span>
                  <InputText v-model="newTagName" placeholder="태그 이름을 입력하세요: " />
                  <div></div>
                  <span>색상 설정: </span>
                  <Button label="색상 선택" icon="pi pi-palette" class="p-button-outlined" @click="toggleColorPicker" />
                  <!-- ColorPicker -->
                  <div v-if="showColorPicker" class="color-picker-popup">
                    <ColorPicker v-model="newTagColor" inline />
                    <!-- <Button label="확인" icon="pi pi-check" class="p-button-success" @click="toggleColorPicker"/> -->
                  </div>
                  <!-- <ColorPicker v-model="newTagColor" inline /> -->
                  <div></div>
                  <Button label="추가" icon="pi pi-check" @click="addNewTag" />
                  <!-- <Button label="취소" icon="pi pi-times" @click="cancelAddTag" class="p-button-danger" /> -->
                </div>
              </Dialog>
            </div>
            <div v-if="tags.length > 0">
              <div class="tags-container">
                <div v-for="tag in tags" :key="tag.value" :style="{
                  backgroundColor: getBackgroundWithOpacity(tag.color, 0.125), // 배경색만 투명도 적용
                  color: tag.color,               // 텍스트 색상
                  padding: '4px 8px',
                  borderRadius: '4px',
                  margin: '4px',
                  display: 'inline-block',
                }">
                  {{ tag.name }}
                  <Button icon="pi pi-times" class="custom-delete-button" @click="deleteTag(tag)" />
                </div>
              </div>
            </div>
            <div v-else>
              <p>태그가 없습니다.</p>
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
    :workspaceData="workspaceDetails" />
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
  import InputText from 'primevue/inputtext';
  import ColorPicker from 'primevue/colorpicker';

  /* views */
  import CardBoard from './views/CardBoardView.vue';
  import KanbanBoard from './views/KanbanBoardView.vue';
  import CalendarView from './views/CalendarView.vue';
  import CardModal from './components/layout/CardModal.vue';

  import WorkspaceAPI from '@/api/proj/workspace';
  import RepoSettingModal from './components/RepoSettingModal.vue';
  import { useProjectStore } from '@/stores/proj/useProjectStore';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const showCardModal = ref(false);
  const selectedCard = ref(null);
  const showTagDialog = ref(false); // 태그 관리 다이얼로그 표시 여부
  const selectedTags = ref([]); // 선택된 태그
  const addCardTag = ref(false);
  const newTagName = ref(""); // 새 태그 이름 입력
  const newTagColor = ref("#FFFFFF"); // 새 태그 색상
  const showColorPicker = ref(false);
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
    cardId: {
      type: [String, Number], // 전달되는 데이터 타입에 맞게 설정
      required: false, // 필수인지 여부
      default: null, // 기본값 설정
    },
  });

  const emit = defineEmits(['update:projects']);
  const isLoading = ref(false);
  const error = ref(null);
  const workspaceDetails = ref(null);
  const showCardTag = ref(null);

  const fetchWorkspace = async () => {
    workspaceDetails.value = await await WorkspaceAPI.getWorkspaceById(props.workspaceId)
  }
  const fetchInstallationId = async () => {
    try {
      const id = await projectStore.getInstallationId(props.projectId);
      console.log(props.projectId)
      githubInstallationId.value = id;
      console.log(githubInstallationId.value)
      return id;
    } catch (err) {
      throw new Error(err)
    }
  }
  const fetchCardTag = async () => {
    if (!props.workspaceId) {
      throw new Error('WorkspaceID is Missing');
    }

    try {
      const response = await axios.get(`card-tags/tag/${props.workspaceId}`);
      showCardTag.value = response.data.data;
      console.log("showCardTag 확인: ", showCardTag.value)
    } catch (err) {
      error.value = err.message || 'Fail to load CardTag';
      console.error('Fail to fetch cardTag: ', err);
    } finally {
      isLoading.value = false;
    }
  };

  // 새 태그 추가 다이얼로그 열기
  const openAddTagDialog = () => {
    addCardTag.value = true;
  };

  const toggleColorPicker = () => {
    showColorPicker.value = !showColorPicker.value;
  };

  const addNewTag = async () => {

    if (!newTagName.value.trim()) {
      alert("태그 이름을 입력하세요!");
      return;
    }
    try {


      const response = await axios.post("card-tags/", {

        tag_name: newTagName.value,
        color: '#' + newTagColor.value,
        workspace_id: props.workspaceId, // 워크스페이스 ID 추가
      });
      if (response.data.success) {
        alert("태그가 성공적으로 추가되었습니다!");


        // 태그 리스트 다시 가져오기
        await fetchCardTag();

        newTagName.value = ""; // 초기화
        newTagColor.value = "#FFFFFF"; // 초기화
        addCardTag.value = false;
      } else {
        throw new Error(response.data.message || "태그 추가 실패");
      }

    } catch (error) {
      console.error("태그 추가 실패: ", error);
      alert("태그 추가 중 오류가 발생했습니다.")
    }
  };

  const deleteTag = async (tag) => {
    try {
      // API 호출로 태그 삭제
      const response = await axios.delete(`/card-tags/${tag.value}`);
      // 로컬 상태에서 태그 삭제
      if (response.data.success) {
        // 데이터 원본에서 태그 삭제
        showCardTag.value = showCardTag.value.filter((t) => t.tag_id !== tag.value);
        alert("태그가 삭제되었습니다!");
      }
    } catch (error) {
      console.error("태그 삭제 실패:", error);
      alert("태그 삭제 중 오류가 발생했습니다.");
    }
  }

  onMounted(() => {
    fetchWorkspace();
    fetchCardTag();
    // addNewTag();
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

  const tags = computed(() => {
    console.log("tag 확인: ", tags);

    return showCardTag.value?.map(tag => ({
      name: tag.tag_name,
      value: tag.tag_id,
      color: tag.color,

    })) || [];

  });

  // 워크스페이스 내에서 카드 찾기 헬퍼 함수
  const findCardInWorkspace = (cardId) => {
    if (!workspaceDetails.value?.cardboards) return null;

    for (const cardboard of workspaceDetails.value.cardboards) {
      const card = cardboard.cards?.find(c => c.card_id === Number(cardId));
      if (card) return card;
    }
    return null;
  };


  function hexToRgba(hex, opacity) {
    // Remove "#" if present
    const sanitizedHex = hex.replace('#', '');

    // Parse RGB values
    const r = parseInt(sanitizedHex.substring(0, 2), 16);
    const g = parseInt(sanitizedHex.substring(2, 4), 16);
    const b = parseInt(sanitizedHex.substring(4, 6), 16);

    // Return rgba string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function getBackgroundWithOpacity(color, opacity) {
    // Ensure the color is a valid hex and convert to rgba
    return hexToRgba(color, opacity);
  }

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

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

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

  .tags-container {
    display: flex;
    /* 태그들을 한 줄로 정렬 */
    flex-wrap: wrap;
    /* 가로 공간이 부족하면 다음 줄로 넘김 */
    gap: 8px;
    /* 태그 간 간격 */
  }

  .custom-delete-button {
    /* font-size: 0.5rem; */
    width: 1vw;
    height: 1vh;
    /* background-color: transparent; */
    /* border:transparent; */
    /* margin-top: 1%; */
    /* color: black; */
    /* justify-content: center; */
    /* align-items: center; */
  }
</style>