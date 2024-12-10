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
			<span>제목: </span>
			<InputText type="text" placeholder="카드 이름 입력" />

			<div class="mb-4">
				<label for="startDate" class="block mb-2">시작일 : </label>
				<Calendar id="startDate" v-model="formData.startDate" class="w-full" :showIcon="true" dateFormat="yy-mm-dd" />
			</div>
			<div class="mb-4">
				<label for="endDate" class="block mb-2">종료일 : </label>
				<Calendar id="endDate" v-model="formData.endDate" class="w-full" :showIcon="true" dateFormat="yy-mm-dd"/>
			</div>
			<label class="block mb-2">설명: </label>
			<InputText v-model="newCard.title" type="text" placeholder="내용 입력"/>
			<div class="mb-4">
				<span>담당자 정보: </span>
				<InputText type="text" v-model="value1" placeholder="이름 입력" @input="() => searchUsers(value1)"/>
				<!-- 검색 결과 목록 -->
				<ul v-if="searchResults.length" class="user-list">
					<li v-for="user in searchResults" :key="user.user_id" class="user-item">
						<span>{{ user.name }}</span>
						<!-- 사용자 추가 버튼 -->
						<Button 
							icon="pi pi-user-plus" 
							@click="addMember(user)" 
							class="p-button-text p-button-success"
						/>
					</li>
				</ul>
				<p v-else-if="value1.trim() && !searchResults.length">검색 결과가 없습니다.</p>
			</div>

			<div class="create-button">
				<Button label="생성" @click="addCard"></Button>
			</div>
		</Dialog>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CardItem from '../components/CardItem.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import axios from 'axios';

const props = defineProps({
	cardboards: {
		type: Array,
		required: true,
		default: () => []
	}
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
    description: '',
    tag_color: '#000000',
});

const searchResults = ref([]);
// 모달 상태 관리
const isDialogVisible = ref(false);
const value1 = ref('');
const openDialog = () => {
	isDialogVisible.value = true;
} 
// 모달 닫기
const closeDialog = () => {
	isDialogVisible.value = false;
};

// 카드 추가 (API 호출)
const addCard = async () => {
    // 입력값 검증
    if (!newCard.value.title.trim()) {
        alert('카드 제목을 입력해주세요.');
        return;
    }

    try {
        // 서버에 카드 생성 요청
        const response = await axios.post('/cards', {
            title: newCard.value.title,
            description: newCard.value.description || '', // 설명이 없을 경우 기본값 설정
            tag_color: newCard.value.tag_color || '#000000', // 태그 색상 기본값
        });

        const addedCard = response.data.data; // 서버에서 반환된 새 카드 데이터

        // 카드 목록에 새 카드 추가 (To Do에 추가)
        organizedCards.todo.push(addedCard);

        // 입력값 초기화
        newCard.value = {
            title: '',
            description: '',
            tag_color: '#000000',
        };

        // 모달 닫기
        closeDialog();
        alert('카드가 성공적으로 생성되었습니다!');
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