<template>
    <div class="post-container">
        <div v-if="postList && postList.length > 0">
            <DataTable
                class="board-container" :value="postList.slice(0,5)" 
                stripedRows tableStyle="min-width: 50rem"
                @row-click="goToPost"
            >
                <Column field="title" header="제목"></Column>
                <Column field="comments" header="댓글수"></Column>
                <Column field="createdAt" header="작성시각"></Column>
                <Column field="userName" header="작성자"></Column>
                <Column field="userPosition" header="직책"></Column>
            </DataTable>
        </div>
        <div v-else>
            게시물이 없습니다.
        </div>
    </div>
</template>


<script setup>
import axios from 'axios';
import { ref, defineProps, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTeamStore } from '@/stores/team';

const teamStore = useTeamStore();
const router = useRouter();
const props = defineProps({
    teamBoardId: Number
});
const teamBoardId = ref(props.teamBoardId);
const postList = ref({
    list: [] 
});

const emit = defineEmits(['changeBoardName']);

const getPostList = async () => {
    try {
        const response = await axios.get(`/teampost/${teamBoardId.value}`);
        postList.value = response.data.data.list;
        postList.value = postList.value.map((post) => ({
            ...post,
            createdAt: formatDate(new Date(post.createdAt)), // Replace with formatted date
        })); 
        console.log(postList)
        } catch (error) {
        console.error('Failed to fetch post list:', error);
    }
};

// 날짜 포맷팅 함수
const formatDate = (dateTime) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTime).toLocaleString('ko-KR', options);
};

const goToPost = (event) => {
    const post = event.data;
    emit('changeBoardName',post.teamBoardId);
    teamStore.updateBoardId(post.teamBoardId);
    teamStore.updatePostId(post.teamPostId);
    router.push("/team/post/detail/view");
}


onMounted(() => {
    getPostList();
});
</script>

<style scoped>
.post-container {
    padding: 1rem;
}

.post-container > div {
    margin-bottom: 1rem;
}


</style>
