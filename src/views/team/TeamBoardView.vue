<template>
    <div class="container">
        <div class="board-view-header">
            <Button 
                :label="teamStore.teamName"  
                icon="pi pi-user" 
                rounded 
                disabled
                class="team-name-container"
            />
            <Button 
                class="team-board-edit" 
                @click="showEditModal = true"
                outlined
                label="게시판 수정"
            />
        </div>
        <div class="board-view-body">
            <div class="board-container">
                <div :class="['board',`board-${board.teamBoardId}`]" v-for="board in boardList" :key="board.teamBoardId">
                    <div class="board-header">
                        <div class="board-title">
                            <Button disabled :label="board.boardTitle" class="board-title-button" />
                        </div>
                        <Button 
                            rounded 
                            outlined
                            class="more-button" 
                            @click="goToThatPostView(board.teamBoardId, board.boardTitle)"
                        >
                            더보기
                        </Button>
                    </div>
                    <BoardPost @changeBoardName="changeBoardName" :teamBoardId="board.teamBoardId"></BoardPost>
                </div>
            </div>
        </div>

        <!-- BoardEdit 모달 -->
        <Dialog 
            :visible="showEditModal" 
            modal 
            @update:visible="showEditModal = $event; getBoardList();" 
            class="board-edit-modal" 
            header="게시판 수정"
            :style="{ width: '30rem', height: '20rem' }"
        >
            <BoardEdit />
        </Dialog>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import BoardPost from './components/BoardPost.vue';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';
import BoardEdit from './TeamBoardEdit.vue';

const teamStore = useTeamStore();
const authStore = useAuthStore();
const router = useRouter();
const boardList = ref([]);
const showEditModal = ref(false); // 모달 상태 관리

const getBoardList = async () => {
    const response = await axios.get(`/teamboard/${authStore.user.userId}/my`);
    boardList.value = response.data.data;
};

const goToThatPostView = (boardId, boardTitle) => {
    teamStore.updateBoardId(boardId);
    teamStore.updateBoardTitle(boardTitle);
    router.push({
        path: "/team/post/view",
        query: {
            boardTitle: boardTitle
        }
    });
};

const changeBoardName = (boardId) => {
    // boardList에서 boardId가 일치하는 항목 찾기
    const board = boardList.value.find(item => item.teamBoardId === boardId);

    if (board) {
        // boardTitle 가져오기
        const boardTitle = board.boardTitle;
        teamStore.updateBoardTitle(boardTitle); // teamStore에 업데이트
    } else {
        console.error(`Board with ID ${boardId} not found.`);
    }
};


onMounted(async () => {
    await getBoardList();
    await teamStore.getTeamName(1); // userId
});
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 auto;
    max-width: 100%;
}

.board-view-header {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
}

.team-name-container {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: #4DB6AC;
    border-color: #4DB6AC;
    cursor: default;
    color: black;
    opacity: 1;
    
}

.team-board-edit {
    margin-top: 1rem;

    padding: 0.8rem 1.5rem;
    border-radius: 0.5rem;
    height: 2.5rem;
    opacity: 1;
}



.board {
    border: 1px solid #009688;
    border-radius: 2.5rem;
    box-shadow: 0 1.5px 3px rgba(59, 122, 63, 0.5);   
     margin: 1rem;
}

.board-header {
    display: flex;
    justify-content: space-between;
    margin: 1rem;
    margin-left: 4rem;
}

.board-title-button {
    color: black;
    opacity: 1;
    background-color: #4DB6AC;
    border-color: #4DB6AC;
}

.more-button {

    height: 2rem;
    width: 4.5rem;
    margin-right: 3rem;
}

.more-button:hover {
    background-color: #4DB6AC;
}

/* 모달 스타일 */
.board-edit-modal {
    width: 80%;
    max-width: 600px;
}
</style>


