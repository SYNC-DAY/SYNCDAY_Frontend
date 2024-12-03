<template>
    <div class="container">
        <div class="board-view-header">
            {{teamStore.teamName }}
            <Button @click="goToBoardEdit">게시판 수정</Button>
        </div>
        <div class="board-container">
            <div :class="['board',`board-${board.teamBoardId}`]" v-for="board in boardList" :key="board.teamBoardId">
                <div class="board-header">
                    <div class="board-title">{{ board.boardTitle }}</div>
                    <Button @click="goToThatPostView(board.teamBoardId,board.boardTitle)">더보기</Button>
                </div>
                <BoardPost :teamBoardId="board.teamBoardId"></BoardPost>
            </div>
        </div>

        <div class="board-plus-button-container" @click="showAddBoardModal">
            <i class="pi pi-plus"></i>
        </div>

    <!-- 게시판 추가 모달 -->
    <div v-if="isAddBoardModalVisible" class="add-board-modal">
        <div class="modal-content">
            <h2>게시판 추가</h2>
            <input v-model="newBoardName" placeholder="게시판 이름을 입력하세요" />
            <div class="modal-actions">
                <button @click="addBoard">추가</button>
                <button @click="closeAddBoardModal">취소</button>
            </div>
        </div>
    </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BoardPost from './components/BoardPost.vue';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';

const teamStore = useTeamStore();
const authStore = useAuthStore();
const router = useRouter();
const boardList = ref([]);
const isAddBoardModalVisible = ref(false); // 모달 표시 여부
const newBoardName = ref(''); // 새로운 게시판 이름


const getBoardList = async () => {
    const response = await axios.get(`/teamboard/1/my`);
    boardList.value = response.data.data;
};

const goToThatPostView = (boardId,boardTitle) => {
    teamStore.updateBoardId(boardId);
    teamStore.updateBoardTitle(boardTitle);
    router.push({
        path: "/team/post/view",
        query: {
            boardTitle: boardTitle
        }
    });
};

// 모달 표시
const showAddBoardModal = () => {
    isAddBoardModalVisible.value = true;
};

// 모달 닫기
const closeAddBoardModal = () => {
    isAddBoardModalVisible.value = false;
    newBoardName.value = ''; // 입력 필드 초기화
};

// 게시판 추가 로직
const addBoard = async () => {
    if (!newBoardName.value.trim()) {
        alert('게시판 이름을 입력해주세요!');
        return;
    }

    try {
        const response = await axios.post('/teamboard', {
            boardTitle: newBoardName.value,
            teamId: teamStore.teamId
        });

        if (response.data.success) {
            alert('게시판이 추가되었습니다.');
            closeAddBoardModal(); // 모달 닫기
            // 게시판 목록을 다시 가져오는 로직 추가 (예: fetchBoards())
        }
    } catch (error) {
        console.error('게시판 추가 중 오류 발생:', error);
        alert('게시판 추가에 실패했습니다.');
    }
};

const goToBoardEdit = () => {
    router.push("/team/board/edit");
}

onMounted( async ()=>{
    await getBoardList();
    await teamStore.getTeamName(1); // userId
})
</script>

<style scoped>
    .container {
    }
    .board {
        border: 2px solid red;
    }
    .board-header {
        display: flex;
    }

    .board-plus-button-container {
    cursor: pointer;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.add-board-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 20px;
}

.modal-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.modal-actions button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal-actions button:first-child {
    background-color: #007bff;
    color: white;
}

.modal-actions button:last-child {
    background-color: #ccc;
    color: black;
}

</style>