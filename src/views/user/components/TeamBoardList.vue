<template>
    <div>
        <template v-if="isLoading">
            <div class="loading-container">
                <p>로딩 중...</p>
            </div>
        </template>
        <template v-else>
            <template v-if="teamBoards.length > 0">
                <div v-for="teamBoard in teamBoards.slice(0,6)" :key="teamBoard.id" class="team-board-container"
                    @click="updateBoardId(teamBoard.teamBoardId,teamBoard.boardTitle)">
                        {{ teamBoard.boardTitle }}
                </div>
            </template>
            <template v-else>
                <div class="no-boards-container">
                    <p>개설된 팀 게시판이 없습니다.</p>
                </div>
            </template>
        </template>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useTeamStore } from '@/stores/team';
import { useRouter } from 'vue-router';

const router = useRouter();
const teamStore = useTeamStore();
const authStore = useAuthStore();
const userId = authStore.user?.userId; // userId가 정의되어 있는지 확인
const teamBoards = ref([]);
const isLoading = ref(true); // 로딩 상태 관리

const getTeamBoardList = async () => {
    try {
        const loadingStartTime = Date.now(); // 로딩 시작 시간 기록
        const response = await axios.get(`/teamboard/${userId}/my`);
        const teamBoardList = response.data?.data || []; // 데이터가 없으면 빈 배열 설정
        teamBoards.value = teamBoardList;

        // 최소 로딩 시간을 0.5초로 설정
        const elapsedTime = Date.now() - loadingStartTime;
        const remainingTime = Math.max(200 - elapsedTime, 0); // 남은 시간 계산
        setTimeout(() => {
            isLoading.value = false; // 최소 0.5초 이후 로딩 종료
        }, remainingTime);
    } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        teamBoards.value = []; // 오류 발생 시 빈 배열로 설정
        isLoading.value = false; // 즉시 로딩 종료
    }
};

const updateBoardId = (id,title) => {
    console.log("id:",id)
    teamStore.updateBoardId(id);
    teamStore.updateBoardTitle(title);
    router.push(`/team/post/view?boardTitle=${title}`)
};


onMounted(() => {
    getTeamBoardList();
});
</script>

<style scoped>
.loading-container {
    text-align: center;
    margin-top: 20px;
}

.team-board-container {
    margin: 1rem;
    margin-bottom: 2rem;
    padding: 10px;
    border: 1px solid #FE5D86;
    border-radius: 5px;
    cursor: pointer;
}

.no-boards-container {
    text-align: center;
    margin-top: 20px;
    color: #888;
}
</style>
