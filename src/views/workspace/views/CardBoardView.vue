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
            <!-- <Button icon="pi pi-plus" label="New" outlined style="margin-right:1rem"></Button> -->
            <Button icon="pi pi-plus" label="New" outlined style="margin-right:1rem" @click="openNewCardboardDialog = true"/>
            <Dialog v-model:visible="openNewCardboardDialog" header="Create New Cardboard" modal :style="{ width: '30rem' }">
              <label for="cardboard-name">이름: </label>
              <InputText id="cardboard-name" v-model="newCardboardName" placeholder="카드보드 입력" class="w-full mb-3" />
            
              <div class="field">
                <label for="startDate">시작일: </label>
                <Calendar id="startDate" v-model="startDate" placeholder="시작일 설정" dateFormat="yy-mm-dd" showIcon class="w-full mb-3"/>
                <div>
                  <label for="endDate">종료일: </label>
                  <Calendar id="endDate" v-model="endDate" placeholder="종료일 설정" dateFormat="yy-mm-dd" showIcon class="w-full mb-3"/>
                </div>
              </div>
              <div class="modal-footer mt-4">
                <!-- <Button label="Cancel" icon="pi pi-times" @click="openNewCardboardDialog = false" class="p-button-text" /> -->
                <Button label="생성" @click="createCardboard" class="p-button-primary" />
              </div>
            </Dialog>
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
                  <!-- Avatar 대신 임시로 img 태그 사용 -->
                  <img :src="cardProps.data.assignee_profile_url" class="avator"
                    :alt="cardProps.data.assignee_name" />
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
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import { InputText } from 'primevue';
import { useToast } from 'primevue/usetoast';
import ProgressBar from 'primevue/progressbar';
import CardModal from '../components/layout/CardModal.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const expandedRowsMap = ref(new Map());
const showCardModal = ref(false);
const selectedCard = ref(null);
const openNewCardboardDialog = ref(false);
const newCardboardName = ref('');
const startDate = ref(null); // 시작일 초기화
const endDate = ref(null); // 종료일 초기화

const props = defineProps({
  cardboards: {
    type: Array,
    required: true,
    default: () => []
  },
  cardboardId: {
		type: [String, Number],
		required: true
  },
  workspaceId: { // workspace_id를 직접 전달받도록 수정
    type: [String, Number],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['cardClick', 'addBoard', 'rowExpand', 'rowCollapse', 'update:cardboards']);

defineExpose({
  expandedRowsMap
});

// const currentProject = computed(() =>
// 	props.projects.find(p => p.proj_id === parseInt(props.projectId))
// );

// const currentCardboard = computed(() =>
//   props.cardboards.find(p => p.cardboard_id === parseInt(props.cardboardId))
// )
// 카드보드 생성 함수
const createCardboard = async () => {
  if (!newCardboardName.value.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Input Required',
      detail: 'Please enter a name for the new cardboard.',
      life: 3000,
    });
    return;
  }

  try {
    // API 요청 보내기
    const response = await axios.post('/cardboards/', {
      title: newCardboardName.value.trim(),
      workspace_id: props.workspaceId, 
      start_time: startDate.value ? new Date(startDate.value).toISOString() : null,
    end_time: endDate.value ? new Date(endDate.value).toISOString() : null,
    });
    console.log("새로운 카드보드 이름: ", newCardboardName.value);
    console.log("워크스페이스 ID: ", props.workspaceId);
    console.log("시작일: ", startDate.value);
    console.log("종료일", endDate.value);
    // 성공적으로 생성되었을 때
    if (response.data.success) {
      const newCardboard = response.data.data; // 생성된 카드보드 정보
      props.cardboards.push(newCardboard); // 로컬 카드보드 리스트 업데이트
      emit('update:cardboards', props.cardboards); // 부모 컴포넌트에 알림

      toast.add({
        severity: 'success',
        summary: 'Cardboard Created',
        detail: `Cardboard '${newCardboardName.value}' has been created.`,
        life: 3000,
      });

      // 다이얼로그 닫기 및 입력 필드 초기화
      openNewCardboardDialog.value = false;
      newCardboardName.value = '';
      startDate.value = null;
      endDate.value = null;
    } else {
      throw new Error(response.data.message || 'Failed to create cardboard.');
    }
  } catch (error) {
    console.error('Error creating cardboard:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create cardboard. Please try again later.',
      life: 3000,
    });
  }
};


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

const onRowClick = async (event) => {
  const clickedCardboardId = event.data.cardboard_id;

  if (expandedRowsMap.value.get(clickedCardboardId)) {
    expandedRowsMap.value.delete(clickedCardboardId);
    emit('rowCollapse', event.data);
  } else {
    try {
      // 1. 카드 정보 가져오기
      const cardsResponse = await axios.get(`/cards/cardboards/${clickedCardboardId}`);
      let cards = cardsResponse.data.data;

      // 2. 각 카드에 대한 추가 정보 가져오기
      cards = await Promise.all(cards.map(async card => {
        // 태그 정보 가져오기
        const tagResponse = card.tag_id ?
          await axios.get(`/card-tags/${card.tag_id}`) : null;

        // 담당자 정보 가져오기
        const assigneeResponse = card.assignee ?
          await axios.get(`/user/${card.assignee}`) : null;

        // 생성자 정보 가져오기
        const creatorResponse = card.created_by ?
          await axios.get(`/user/${card.created_by}`) : null;

        // 카드 정보 조립
        return {
          ...card,
          card_title: card.title,        // title을 card_title로 매핑
          assignee_name: assigneeResponse?.data.data.userName,
          assignee_profile_url: assigneeResponse?.data.data.profilePhoto,
          creator_name: creatorResponse?.data.data.userName,
          tag_name: tagResponse?.data.data.tag_name,
          tag_color: tagResponse?.data.data.color
        };
      }));

      // 3. 조립된 카드 데이터를 카드보드에 저장
      const cardboardIndex = props.cardboards.findIndex(
        board => board.cardboard_id === clickedCardboardId
      );
      if (cardboardIndex !== -1) {
        props.cardboards[cardboardIndex].cards = cards;
      }

      expandedRowsMap.value.set(clickedCardboardId, true);
      emit('rowExpand', event.data);
    } catch (error) {
      console.error('Failed to fetch card data:', error);
    }
  }
};

watch(
  () => route.query.cardId,
  async (newCardId) => {
    if (newCardId) {
      try {
        // 1. 우선 현재 워크스페이스의 모든 카드보드를 순회하며 cardId가 일치하는 카드 찾기
        const cardboardWithCard = props.cardboards.find(board => 
          board.cards?.some(card => card.card_id === Number(newCardId))
        );

        if (cardboardWithCard) {
          const cardboardId = cardboardWithCard.cardboard_id;
          
          // 2. 해당 카드보드 펼치기
          expandedRowsMap.value.set(cardboardId, true);

          // 3. 이미 카드 데이터가 있다면 그대로 사용, 없으면 새로 불러오기
          if (!cardboardWithCard.cards) {
            // 카드보드의 카드 목록 가져오기
            const cardsResponse = await axios.get(`/cards/cardboards/${cardboardId}`);
            let cards = cardsResponse.data.data;

            // 카드 정보 조립
            cards = await Promise.all(cards.map(async card => {
              const tagResponse = card.tag_id ?
                await axios.get(`/card-tags/${card.tag_id}`) : null;
              const assigneeResponse = card.assignee ?
                await axios.get(`/user/${card.assignee}`) : null;
              const creatorResponse = card.created_by ?
                await axios.get(`/user/${card.created_by}`) : null;

              return {
                ...card,
                card_title: card.title,
                assignee_name: assigneeResponse?.data.data.userName,
                assignee_profile_url: assigneeResponse?.data.data.profilePhoto,
                creator_name: creatorResponse?.data.data.userName,
                tag_name: tagResponse?.data.data.tag_name,
                tag_color: tagResponse?.data.data.color
              };
            }));

            // 조립된 카드 데이터를 카드보드에 저장
            const cardboardIndex = props.cardboards.findIndex(
              board => board.cardboard_id === cardboardId
            );
            if (cardboardIndex !== -1) {
              props.cardboards[cardboardIndex].cards = cards;
            }
          }

          // 4. 모달에 표시할 카드 찾기
          const selectedCardData = cardboardWithCard.cards.find(
            card => card.card_id === Number(newCardId)
          );
          
          if (selectedCardData) {
            selectedCard.value = selectedCardData;
            showCardModal.value = true;
          }
        }
      } catch (error) {
        console.error('Failed to process card from URL:', error);
      }
    }
  },
  { immediate: true }
);

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



const onCardClick = (cardData) => {
  console.log(cardData)
  selectedCard.value = cardData;
  showCardModal.value = true;
};

// Modal close handler
const closeCardModal = () => {
  showCardModal.value = false;
  selectedCard.value = null;
  // URL에서 cardId 제거
  const newQuery = { ...route.query };
  delete newQuery.cardId;
  router.replace({ query: newQuery });
};
</script>

<style scoped>
.avator {
  width: 1.5rem;       
  height: 1.5rem;    
  border-radius: 50%; /* 원형으로 만들기 */
  object-fit: cover;  /* 이미지 비율 유지하면서 영역 채우기 */
  min-width: 1.5rem;    /* 최소 크기 제한 */
  max-width: 1.5rem;    /* 최대 크기 제한 */
  min-height: 1.5rem;   /* 최소 크기 제한 */
  max-height: 1.5rem;   /* 최대 크기 제한 */
}
</style>