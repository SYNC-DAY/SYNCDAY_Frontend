<template>
    <div class="post-container">
        <div v-if="postList.list && postList.list.length > 0">
            <div v-for="post in postList.list.slice(0, 3)" :key="post.teamPostId">
                    {{ post.title }} {{ formatDate(post.createdAt) }} {{ post.userName }} ({{ post.userPosition }})
            </div>
        </div>
        <div v-else>
            게시물이 없습니다.
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import { ref, defineProps, onMounted } from 'vue';

const props = defineProps({
    teamBoardId: Number
});
const teamBoardId = ref(props.teamBoardId);
const postList = ref({
    list: [] 
});

const getPostList = async () => {
    try {
        const response = await axios.get(`/teampost/${teamBoardId.value}`);
        postList.value = response.data.data; 
    } catch (error) {
        console.error('Failed to fetch post list:', error);
    }
};

// 날짜 포맷팅 함수
const formatDate = (dateTime) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTime).toLocaleString('ko-KR', options);
};


onMounted(() => {
    getPostList();
});
</script>

<style scoped>
.post-container {
    border: 2px solid black;
    padding: 1rem;
    margin-top: 1rem;
}

.post-container > div {
    margin-bottom: 1rem;
}
</style>
