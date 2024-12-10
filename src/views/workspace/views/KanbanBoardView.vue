<template>
	<div class="kanban-container container-row">
		<div class="kanban-column">
			<strong>To Do</strong>
			<Card class="kanban-background container-col">
				<template #content>
					<div v-for="card in organizedCards.todo" :key="card.card_id" class="card-wrapper">
						<div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
						<CardItem :card="card" />
					</div>
					<div class="container-row justify-center">
						<Button 
							icon="pi pi-plus" 
							rounded 
							severity="secondary" 
							@click="openDialog" 
						/>
					</div>
				</template>
			</Card>
		</div>

		<div class="kanban-column">
			<strong>In Progress</strong>
			<Card>
				<template #content>
					<div v-for="card in organizedCards.inProgress" :key="card.card_id" class="card-wrapper">
						<div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
						<CardItem :card="card" />
					</div>
					<div class="container-row justify-center">
						<Button 
							icon="pi pi-plus" 
							rounded 
							severity="secondary" 
							@click="openDialog" 
						/>
					</div>
				</template>
			</Card>
		</div>

		<div class="kanban-column">
			<strong>Done</strong>
			<Card>
				<template #content>
					<div v-for="card in organizedCards.done" :key="card.card_id" class="card-wrapper">
						<div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
						<CardItem :card="card" />
					</div>
					<div class="container-row justify-center">
						<Button 
							icon="pi pi-plus" 
							rounded 
							severity="secondary" 
							@click="openDialog" 
						/>
					</div>
				</template>
			</Card>
		</div>

		<Dialog v-model:visible="isDialogVisible" header="카드 추가" :style="{ width: '30vw' }" modal>
			<div class="mb-4">
				<span>카드보드 선택: </span>
				<Select v-model="selectedCardBoard" :options="props.cardboards" optionLabel="title" optionValue="cardboard_id" placeholder="카드 보드 선택" class="w-full" />
			</div>
			<div class="mb-4">
				<span>태그 선택: </span>
				<Select v-model="selectCardTag" :options="tagOptions" optionLabel="tag_name" optionValue="tag_id" placeholder="태그 선택" class="w-full" />
			</div>
			<div class="mb-4"> 
				<span>제목: </span>
				<InputText v-model="newCard.title" type="text" placeholder="카드 이름 입력" />
			</div>
			<div class="mb-4">
				<label for="startDate" class="block mb-2">시작일 : </label>
				<Calendar id="startDate" v-model="formData.startDate" class="w-full" :showIcon="true" dateFormat="yy-mm-dd" />
			</div>
			<div class="mb-4">
				<label for="endDate" class="block mb-2">종료일 : </label>
				<Calendar id="endDate" v-model="formData.endDate" class="w-full" :showIcon="true" dateFormat="yy-mm-dd"/>
			</div>
			<label class="block mb-2">설명: </label>
			<InputText v-model="newCard.content" type="text" placeholder="내용 입력"/>
			<div class="mb-4">
				<span>담당자 정보 </span>
				<InputText type="text" v-model="value1" placeholder="이름 입력" @input="() => searchUsers(value1)"/>
				<!-- 검색 결과 목록 -->
				<ul v-if="searchResults.length" class="user-list">
					<li v-for="user in searchResults" :key="user.user_id" class="user-item">
						<span>{{ user.name }}</span>
						<!-- 사용자 추가 버튼 -->
						<Button 
							icon="pi pi-user-plus" 
							@click="assignAssignee(user)" 
							class="p-button-text p-button-success"
						/>
					</li>
				</ul>
				<p v-else-if="value1.trim() && !searchResults.length">검색 결과가 없습니다.</p>
				<!-- 참석자 목록 -->
  				<ul>
    				<li v-for="member in members" :key="member.userId">
      					{{ member.name }}
      					<Button icon="pi pi-user-minus" @click="removeMember(member)" class="p-button-text p-button-danger"/>
    				</li>
  				</ul>
			</div>
			<!-- <div class="mb-4">
				<span>생성자 정보: {{ username }} ({{ email }})</span>
			</div> -->

			<div class="create-button">
				<Button label="생성" @click="addCard"></Button>
			</div>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import CardItem from '../components/CardItem.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Calendar from 'primevue/calendar';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import fetchWorkspace from '../WorkspaceView.vue';

const authStore = useAuthStore();
const username = ref({});
const email = ref({});
const members = ref([]); 
username.value = authStore.user.userName;
email.value = authStore.user.email;

const props = defineProps({
	cardboards: {
		type: Array,
		required: true,
		default: () => []
	},
	// cardTag: {
	// 	type: Array,
	// 	required: true,
	// 	default: () => []
	// }
});
// State
const formData = ref({
	// projName: '',
	startDate: null,
	endDate: null,
	// vcsType: null
});

const newCard = ref({
    title: '',
    content: '',
	cardboard_id: '',
	created_by: '',
	assignee: '',
	tag_id: '',
    // tag_color: '#000000',
});

const searchResults = ref([]);
// 모달 상태 관리
const isDialogVisible = ref(false);
const value1 = ref('');
const selectedCardBoard = ref(null);
const selectCardTag = ref(null);

const openDialog = () => {
	isDialogVisible.value = true;
} 
// 모달 닫기
const closeDialog = () => {
	isDialogVisible.value = false;
};

const tagOptions = ref([]);
const fetchTagsByWorkspaceId = async (workspaceId) => {
  try {
    const response = await axios.get(`/card-tags/tag/${workspaceId}`);
    tagOptions.value = response.data.data.map(tag => ({
      tag_id: tag.tag_id,
      tag_name: tag.tag_name,
    }));
	console.log("tagOptions 확인: ", tagOptions.value);
  } catch (error) {
    console.error('태그 데이터를 가져오는 중 오류 발생:', error);
    tagOptions.value = [];
  }
};
// const tagOptions = computed(() => {
//   return cardTags.value.map(tag => ({
//     tag_id: tag.tag_id,
//     tag_name: tag.tag_name,
//   }));
// });


// 카드 추가 (API 호출)
const addCard = async () => {
    // 입력값 검증
    if (!newCard.value.title.trim()) {
        alert('카드 제목을 입력해주세요.');
        return;
    }

    try {
        // 서버에 카드 생성 요청
        const response = await axios.post('/cards/', {
            title: newCard.value.title,
            content: newCard.value.content || '', // 설명이 없을 경우 기본값 설정
            cardboard_id: selectedCardBoard.value,
            user_id: authStore.user.userId,
            start_time: formData.value.startDate,
            end_time: formData.value.endDate,
            assignee: newCard.value.assignee.user_id, // assignee가 없는 경우 null
            tag_id: selectCardTag.value,
        });
		console.log("assign 찍기", newCard.value.assignee);

        const addedCard = response.data.data; // 서버에서 반환된 새 카드 데이터
        console.log("생성된 카드: ", addedCard);

        // 적절한 카드보드에 새 카드 추가
        const targetBoard = props.cardboards.find(
            (board) => board.cardboard_id === selectedCardBoard.value
        );
        if (targetBoard) {
            targetBoard.cards.push(addedCard); // 새로운 카드를 추가
        }


        // Organized Cards 업데이트
        organizedCards.value.todo.push(addedCard);

        // 입력값 초기화
        newCard.value = {
            title: '',
            content: '',
            start_time: '',
            end_time: '',
            created_by: '',
            assignee: null,
            tag_id: '',
        };
		
        // 모달 닫기
        closeDialog();
        alert('카드가 성공적으로 생성되었습니다!');
		window.location.reload();
    } catch (error) {
        console.error('카드 추가 중 오류 발생:', error);
        alert('카드를 추가하는 도중 문제가 발생했습니다.');
    }
};


const searchUsers = async (keyword) => {
	try {
		const sanitizedKeyword = keyword.trim();
		if (!sanitizedKeyword) {
			searchResults.value = [];
			return;
		}

		const response = await axios.get(`/user/search`, {
			params: {
				keyword: sanitizedKeyword
			}
		});

		console.log("조회된 유저들: ", response)

		if (response.data.data) {
			searchResults.value = response.data.data.filter(user => user.name.includes(sanitizedKeyword));
			//   searchResults.value = response.data.data;
		} else {
			searchResults.value = [];
		}
	} catch (error) {
		console.error('Error fetching search results:', error);
		searchResults.value = [];
	}
};

const assignAssignee = (user) => {
    // 이미 지정된 사용자인지 확인
    if (newCard.value.assignee && newCard.value.assignee.user_id === user.userId) {
        alert(`${user.name}님은 이미 담당자로 지정되었습니다.`);
        return;
    }

    // 참석자로 추가
    addMember(user);

    // Assignee 지정
    newCard.value.assignee = {
        user_id: user.userId,
        name: user.name,
		email: user.email,
    };
    alert(`${user.name}님이 담당자로 지정되었습니다.`);
};
// 태그 정보를 직접 props.cardboards에서 추출하여 options 생성
// const cardTags = computed(() => {
//   const tags = [];
//   props.cardboards.forEach((board) => {
//     board.cards.forEach((card) => {
//       if (card.tag_id && card.tag_name) {
//         tags.push({
//           tag_id: card.tag_id,
//           tag_name: card.tag_name,
//         });
//       }
//     });
//   });

//   // 중복 태그 제거
//   return Array.from(new Map(tags.map((tag) => [tag.tag_id, tag])).values());
// });

const addMember = (user) => {
  // 주관자인 경우 추가 불가
  if (user.userId === authStore.user.userId) {
    alert("주관자는 참석자로 추가할 수 없습니다.");
    return;
  }

  // 이미 참석자로 추가된 경우 추가 불가
  if (members.value.some((attendee) => attendee.userId === user.userId)) {
    alert("이미 추가된 사용자입니다.");
    return;
  }

  // 참석자 추가
  members.value.push(user);
  alert(`${user.name}님이 참석자로 추가되었습니다.`);
};

const removeMember = (attendee) => {
  members.value = members.value.filter(
    (member) => member.userId !== attendee.userId
  );
  alert(`${attendee.name}님이 참석자 목록에서 제거되었습니다.`);
};

// Computed property to organize cards by status
const organizedCards = computed(() => {
	const organized = {
		todo: [],
		inProgress: [],
		done: []
	};

	// props.cardboards.forEach(board => {
	// 	board.cards.forEach(card => {
	// 		// You can implement your own logic to determine card status
	// 		// For now, all cards go to todo
	// 		organized.todo.push(card);
	// 	});
	// });

	props.cardboards?.forEach(board => {
	// board.cards가 undefined 또는 null이면 빈 배열로 대체
	(board.cards || []).forEach(card => {
		organized.todo.push(card);
	});
});


	return organized;
});

// 컴포넌트 로드시 태그 로드
onMounted(() => {
  const initialWorkspaceId = props.cardboards[0]?.workspace_id; // 첫 카드보드의 workspace_id 사용
  if (initialWorkspaceId) {
    fetchTagsByWorkspaceId(initialWorkspaceId);
  }
});



</script>

<style scoped>
.kanban-container {
	margin-top: 1rem;
	align-items: start;
	gap: 1.5rem;
}

.kanban-background {}

.kanban-column {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.card-wrapper {
	position: relative;
	margin-bottom: 1rem;
}


.tag-indicator {
	width: 1rem;
	height: auto;
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
}
</style>