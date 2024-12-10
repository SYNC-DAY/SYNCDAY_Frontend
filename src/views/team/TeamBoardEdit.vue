<template>
    <div class="board-container">
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
                <div class="team-button">
                    <Button outlined @click="updateBoardTitle(board.teamBoardId)">완료</Button>
                    <Button outlined @click="cancelEdit">취소</Button>
                </div>
            </template>
            <template v-else>
                <!-- 일반 모드 -->
                <div>
                    {{ board.boardTitle }}
                </div>
                <div class="team-button">
                    <Button outlined @click="enterEditMode(board.teamBoardId, board.boardTitle)">수정</Button>
                    <Button outlined @click="deleteBoard(board.teamBoardId)">삭제</Button>
                </div>
            </template>
        </div>

        <!-- 플러스 버튼 및 입력 필드 -->
        <div class="board-line plus-button-container">
            <template v-if="isAdding">
                <input 
                    v-model="newBoardTitle" 
                    class="edit-input" 
                    placeholder="새 게시판 이름을 입력하세요" 
                />
                <div class="team-button">
                    <Button outlined @click="addBoard">추가</Button>
                    <Button outlined @click="cancelAdd">취소</Button>
                </div>
            </template>
            <template v-else>
                <div class="team-button2" style="justify-content: space-between;">
                    <Button outlined icon="pi pi-plus" label="추가" @click="startAdding" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTeamStore } from '@/stores/team';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const teamStore = useTeamStore();
const authStore = useAuthStore();
const router = useRouter();
const boardList = ref([]);
const editMode = ref(null); // 수정 중인 게시판 ID
const editedTitle = ref(''); // 수정 중인 제목
const isAdding = ref(false); // 추가 모드 여부
const newBoardTitle = ref(''); // 새로운 게시판 제목
const toast = useToast();

// 게시판 목록 가져오기
const getBoardList = async () => {
    const response = await axios.get(`/teamboard/${authStore.user.userId}/my`);
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
        // alert('제목을 입력해주세요!');
        toast.add({
        severity: "warn",
        summary: "제목 입력",
        detail: "제목을 입력해주세요!",
        life: 3000,
        });
        return;
    }

    try {
        const response = await axios.put(
            `/teamboard/${teamBoardId}`, 
            editedTitle.value, // 문자열 전송
            {
                headers: { 'Content-Type': 'text/plain' },
            }
        );

        if (response.data.success) {
            // alert('게시판 제목이 수정되었습니다.');
            toast.add({
                severity: "success",
                summary: "멤버 추가",
                detail: "멤버가 성공적으로 추가되었습니다.",
                life: 3000,
            });
            const updatedBoard = boardList.value.find(
                (board) => board.teamBoardId === teamBoardId
            );
            if (updatedBoard) {
                updatedBoard.boardTitle = editedTitle.value;
            }
            cancelEdit();
        }
    } catch (error) {
        console.error('게시판 제목 수정 중 오류 발생:', error);
        // alert('제목 수정에 실패했습니다.');
        toast.add({
            severity: "error",
            summary: "게시판 제목 수정 중 오류 발생",
            detail: "제목 수정에 실패했습니다!",
            life: 3000,
        });
    }
};

// 게시판 삭제
const deleteBoard = async (teamBoardId) => {
    // if (!confirm('정말로 이 게시판을 삭제하시겠습니까?')) return;

    try {
        const response = await axios.delete(`/teamboard/${teamBoardId}`);
        if (response.data.success) {
            // alert('게시판이 삭제되었습니다.');
            toast.add({
                severity: "success",
                summary: "게시판 삭제",
                detail: "게시판이 삭제되었습니다!",
                life: 3000,
            });
            boardList.value = boardList.value.filter(
                (board) => board.teamBoardId !== teamBoardId
            );
        }
    } catch (error) {
        console.error('게시판 삭제 중 오류 발생:', error);
        // alert('게시판 삭제에 실패했습니다.');
        toast.add({
            severity: "error",
            summary: "게시판 삭제 중 오류 발생",
            detail: "게시판 삭제에 실패했습니다!",
            life: 3000,
        });
    }
};

// 추가 모드 시작
const startAdding = () => {
    isAdding.value = true;
};

// 추가 모드 취소
const cancelAdd = () => {
    isAdding.value = false;
    newBoardTitle.value = ''; // 입력 필드 초기화
};

// 게시판 추가
const addBoard = async () => {
    if (!newBoardTitle.value.trim()) {
        // alert('게시판 이름을 입력해주세요!');
        toast.add({
            severity: "warn",
            summary: "게시판 이름 입력",
            detail: "게시판 이름을 입력해주세요!",
            life: 3000,
        });
        return;
    }

    try {
        const response = await axios.post('/teamboard', {
            boardTitle: newBoardTitle.value,
            teamId: teamStore.teamId, // 예시로 teamId를 사용
        });

        if (response.data.success) {
            // alert('게시판이 추가되었습니다.');
            toast.add({
                severity: "success",
                summary: "멤버 추가",
                detail: "멤버가 성공적으로 추가되었습니다.",
                life: 3000,
            });
            boardList.value.push({
                teamBoardId: response.data.data.teamBoardId,
                boardTitle: newBoardTitle.value,
            });
            cancelAdd(); // 추가 모드 종료
        }
    } catch (error) {
        console.error('게시판 추가 중 오류 발생:', error);
        // alert('게시판 추가에 실패했습니다.');
        toast.add({
            severity: "error",
            summary: "게시판 추가 중 오류 발생",
            detail: "게시판 추가에 실패했습니다.",
            life: 3000,
         });

    }
};

onMounted(async () => {
    await getBoardList();
});
</script>

<style scoped>
.board-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    max-width: 100%;
}

.board-line {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-bottom: 1px solid #ddd;
    justify-content: space-between;
    width: 100%;
}

    /* .plus-button-container {
        justify-content: center;
        margin-top: 20px;
    } */

.edit-input {
    /* flex: 1; */
    display: flex;
    padding: 5px;
    font-size: 14px;
    border: 1px solid #ccc;
    /* width: 1rem; */
    border-radius: 4px;
}
/* 
.edit-input .input {
    width: 1rem;
} */

.team-button {
    display: flex;
    gap: 5px;
}

</style>
