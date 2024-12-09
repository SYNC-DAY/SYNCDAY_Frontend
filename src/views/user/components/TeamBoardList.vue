<template>
    <div>
        <template v-if="isLoading">
            <div class="loading-container">
                <p>로딩 중...</p>
            </div>
        </template>
        <template v-else>
            <template v-if="teamPostList.length > 0">
                <div v-for="teamPost in teamPostList" :key="teamPost.id" class="team-post-container"
                @click="goToPost(teamPost)">
                        [{{teamPost.boardTitle}}] {{teamPost.title}} ({{teamPost.comments}})
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
const userId = authStore.user.userId; // userId가 정의되어 있는지 확인
const teamPostList = ref([]);
const isLoading = ref(true); // 로딩 상태 관리

const getTeamPost = async () => {
    try {
        const loadingStartTime = Date.now(); // 로딩 시작 시간 기록
        const response = await axios.get(`/teampost/myteam/${userId}`);
        teamPostList.value = response.data.data.slice(0,8);
    

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

const goToPost = (teamPost) => {
    teamStore.updatePostId(teamPost.teamPostId);
    teamStore.updateBoardId(teamPost.teamBoardId);
    teamStore.updateBoardTitle(teamPost.boardTitle);
    teamStore.getTeamName(userId);
    router.push('/team/post/detail/view');
};



onMounted(async () => {
    await getTeamPost();
});
</script>

<style scoped>
.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    font-size: 1.2rem;
    color: #444;
    background-color: #f4f4f4;
    border-radius: 4px;
    border: 1px solid #ddd;
}

.team-post-container {
    margin: 0.5rem 0;
    padding: 0.8rem 1rem;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
}

.team-post-container:hover {
    border-color: #009688;
    box-shadow: 0 1.5px 3px rgba(59, 122, 63, 0.5);
}

.no-boards-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    font-size: 1.2rem;
    color: #999;
    background-color: #f4f4f4;
    border: 1px solid #ddd;
    border-radius: 4px;
}



.team-post-container p {
    margin: 0;
    font-size: 0.9rem;
    color: #666;
}

.team-post-container small {
    font-size: 0.8rem;
    color: #999;
}



</style>
