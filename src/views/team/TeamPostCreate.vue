<template>
    <div class="post-detail-container">
        <!-- Header -->
        <div class="detail-header">
            <div class="team-name-container">
                {{ teamStore.teamName }} - {{ teamStore.boardTitle }}
            </div>
            <div class="button-container">
                <Button @click="submitPost">작성 완료</Button>
                <Button @click="goToList">목록</Button>
            </div>
        </div>

        <!-- Body -->
        <div class="detail-body">
            <input v-model="newPost.title" class="edit-title" placeholder="제목을 입력하세요" />
            <textarea v-model="newPost.content" class="edit-content" placeholder="내용을 입력하세요"></textarea>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import axios from 'axios';

const teamStore = useTeamStore();
const authStore = useAuthStore();
const router = useRouter();

const newPost = ref({
    title: '',
    content: '',
});

// 게시글 작성 완료
const submitPost = async () => {
    if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
        alert('제목과 내용을 입력해주세요!');
        return;
    }

    try {
        const response = await axios.post('/teampost', {
            title: newPost.value.title,
            content: newPost.value.content,
            userId: authStore.user.userId,
            teamBoardId: teamStore.boardId,
        });

        if (response.data.success) {
            alert('게시글이 작성되었습니다.');
            router.push('/team/post/view'); // 목록 페이지로 이동
        }
    } catch (error) {
        console.error('게시글 작성 중 오류 발생:', error);
        alert('게시글 작성에 실패했습니다.');
    }
};

// 목록 이동
const goToList = () => {
    router.push('/team/post/view');
};
</script>

<style scoped>
/* Container 스타일 */
.post-detail-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
}

/* Header 스타일 */
.detail-header {
    margin-bottom: 20px;
}

.team-name-container {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.button-container {
    display: flex;
    gap: 10px;
}

/* Body 스타일 */
.detail-body {
    margin-bottom: 20px;
    line-height: 1.6;
    font-size: 16px;
    color: #333;
}

/* Input 스타일 */
.edit-title {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    font-size: 18px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.edit-content {
    width: 100%;
    height: 200px;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 5px;
    resize: none;
}
</style>
