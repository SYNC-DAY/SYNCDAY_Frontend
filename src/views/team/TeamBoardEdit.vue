<template>
    <div class="board-container">
        <div class="back-button-container">
            <Button class="back-button" @click="goToBoardList">게시판 목록으로 돌아가기</Button>
        </div>
        <div 
            class="board-line" 
            v-for="board in boardList" 
            :key="board.teamBoardId"
        >
            <template v-if="editMode === board.teamBoardId">
                <!-- 수정 모드 -->
                <input 
                    v-model="editedTitle" 
                    class="edit-input" 
                    placeholder="새 제목을 입력하세요" 
                />
                <Button @click="updateBoardTitle(board.teamBoardId)">
                    완료
                </Button>
                <Button @click="cancelEdit">
                    취소
                </Button>
            </template>
            <template v-else>
                <!-- 일반 모드 -->
                <div>
                    {{ board.boardTitle }}
                </div>
                <Button @click="enterEditMode(board.teamBoardId, board.boardTitle)">
                    수정
                </Button>
                <Button @click="deleteBoard(board.teamBoardId)">
                    삭제
                </Button>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const authStore = useAuthStore();
const router = useRouter();
const boardList = ref([]);
const editMode = ref(null); // 수정 중인 게시판 ID
const editedTitle = ref(''); // 수정 중인 제목

// 게시판 목록 가져오기
const getBoardList = async () => {
    const response = await axios.get(`/teamboard/${authStore.user.userId}/my`); // 1은 userId
    boardList.value = response.data.data;
};

// 수정 모드로 전환
const enterEditMode = (teamBoardId, currentTitle) => {
    editMode.value = teamBoardId;
    editedTitle.value = currentTitle;
};

// 수정 모드 취소
const cancelEdit = () => {
    editMode.value = null;
    editedTitle.value = '';
};

// 게시판 제목 업데이트
const updateBoardTitle = async (teamBoardId) => {
    if (!editedTitle.value.trim()) {
        alert('제목을 입력해주세요!');
        return;
    }

    try {
        const response = await axios.put(
            `/teamboard/${teamBoardId}`, 
            editedTitle.value, // 문자열 전송
            {
                headers: {
                    'Content-Type': 'text/plain',
                },
            }
        );

        if (response.data.success) {
            alert('게시판 제목이 수정되었습니다.');
            // 수정된 제목을 반영
            const updatedBoard = boardList.value.find(
                (board) => board.teamBoardId === teamBoardId
            );
            if (updatedBoard) {
                updatedBoard.boardTitle = editedTitle.value;
            }
            cancelEdit(); // 수정 모드 종료
        }
    } catch (error) {
        console.error('게시판 제목 수정 중 오류 발생:', error);
        alert('제목 수정에 실패했습니다.');
    }
};

// 게시판 삭제
const deleteBoard = async (teamBoardId) => {
    if (!confirm('정말로 이 게시판을 삭제하시겠습니까?')) return;

    try {
        const response = await axios.delete(`/teamboard/${teamBoardId}`);
        if (response.data.success) {
            alert('게시판이 삭제되었습니다.');
            boardList.value = boardList.value.filter(
                (board) => board.teamBoardId !== teamBoardId
            );
        }
    } catch (error) {
        console.error('게시판 삭제 중 오류 발생:', error);
        alert('게시판 삭제에 실패했습니다.');
    }
};

const goToBoardList = () => {
    router.push("/team/board/view");
}

// 초기 데이터 로드
onMounted(async () => {
    await getBoardList();
});
</script>

<style scoped>
.board-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.board-line {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.edit-input {
    flex: 1;
    padding: 5px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
