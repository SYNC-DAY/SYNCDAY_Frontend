<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <Button :label="teamStore.teamName" icon="pi pi-users" severity="info" disabled class="p-button-rounded bg-teal-400 border-teal-400 text-gray-900" />
            <Button label="게시판 수정" icon="pi pi-pencil" @click="showEditModal = true" severity="secondary" class="p-button-outlined" />
        </div>

        <!-- Boards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card v-for="board in boardList" :key="board.teamBoardId" class="shadow-md">
                <template #header>
                    <div class="flex justify-between items-center p-4 bg-gray-50">
                        <h3 class="text-lg font-medium text-gray-900">{{ board.boardTitle }}</h3>
                        <Button icon="pi pi-arrow-right" @click="goToThatPostView(board.teamBoardId, board.boardTitle)" severity="info" class="p-button-rounded p-button-outlined p-button-sm" />
                    </div>
                </template>
                <BoardPost @changeBoardName="changeBoardName" :teamBoardId="board.teamBoardId" />
            </Card>
        </div>

        <!-- Edit Modal -->
        <Dialog v-model:visible="showEditModal" modal header="게시판 수정" :style="{ width: '500px' }" :dismissableMask="true">
            <BoardEdit
                @close="
                    showEditModal = false;
                    getBoardList();
                "
            />
        </Dialog>
    </div>
</template>
<script setup>
    import { useAuthStore } from '@/stores/auth';
    import { useTeamStore } from '@/stores/team';
    import axios from 'axios';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';
    import BoardPost from './components/BoardPost.vue';
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
            path: '/team/post/view',
            query: {
                boardTitle: boardTitle
            }
        });
    };

    const changeBoardName = (boardId) => {
        // boardList에서 boardId가 일치하는 항목 찾기
        const board = boardList.value.find((item) => item.teamBoardId === boardId);

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
