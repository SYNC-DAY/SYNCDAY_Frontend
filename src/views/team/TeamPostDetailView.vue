<template>
    <div class="post-detail-container">
        <!-- Header -->
        <div class="detail-header">
            <div class="team-name-container">
                {{ teamStore.teamName }} - {{ teamStore.boardTitle }}
            </div>
            <div class="button-container">
                <div v-if="isMyPost" class="my-post-button">
                    <Button v-if="!isEditMode" @click="toggleEditMode">수정</Button>
                    <Button v-if="isEditMode" @click="updatePost">수정 완료</Button>
                    <Button v-if="isEditMode" @click="cancelEdit">취소</Button>
                    <Button @click="deletePost">삭제</Button>
                </div>
                <Button @click="goToList">목록</Button>
            </div>
        </div>

        <!-- Body -->
        <div class="detail-body">
            <template v-if="!isEditMode">
                <h1 class="post-title">{{ post.title }}</h1>
                <div class="post-meta">
                    <span class="author">작성자: {{ post.userName }}({{ post.userPosition }})</span>
                    <span class="date">작성일: {{ post.createdAt }}</span>
                </div>
                <p>
                    {{ post.content }}
                </p>
            </template>

            <template v-else>
                <input v-model="editedPost.title" class="edit-title" placeholder="제목을 입력하세요" />
                <textarea v-model="editedPost.content" class="edit-content" placeholder="내용을 입력하세요"></textarea>
            </template>
        </div>

        <!-- Footer -->
        <div class="detail-footer">
            <PostComment></PostComment>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import PostComment from './components/PostComment.vue';

const teamStore = useTeamStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const searchType = route.query.searchType;
const searchQuery = route.query.searchQuery;

const post = ref({}); // 게시글 정보
const isMyPost = ref(false); // 내가 작성한 글 여부
const isEditMode = ref(false); // 수정 모드 여부
const editedPost = ref({}); // 수정 중인 게시글

const getPostDetail = async () => {
    const response = await axios.get(`/teampost/${teamStore.boardId}/${teamStore.postId}`);
    post.value = response.data.data;

    // 사용자 확인
    isMyPost.value = authStore.user.userId === post.value.userId;
    editedPost.value = { ...post.value }; // 수정 모드 데이터 초기화
};

// 수정 모드 전환
const toggleEditMode = () => {
    isEditMode.value = true;
};

// 수정 완료
const updatePost = async () => {
    try {
        const response = await axios.put(`/teampost/${teamStore.postId}`, {
            
                title: editedPost.value.title,
                content: editedPost.value.content,
                createdAt: post.value.createdAt,
                userId: authStore.user.userId,
                teamBoardId: teamStore.boardId
        });

        if (response.data.success) {
            alert('게시글이 수정되었습니다.');
            post.value = { ...editedPost.value }; // 게시글 업데이트
            isEditMode.value = false; // 수정 모드 종료
        }
    } catch (error) {
        console.error('게시글 수정 중 오류 발생:', error);
        alert('게시글 수정에 실패했습니다.');
    }
};

// 수정 취소
const cancelEdit = () => {
    isEditMode.value = false; // 수정 모드 종료
    editedPost.value = { ...post.value }; // 변경사항 초기화
};

// 게시글 삭제
const deletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
        const response = await axios.delete(`/teampost/${teamStore.postId}`);
        if (response.data.success) {
            alert('게시글이 삭제되었습니다.');
            router.push('/team/post/view'); // 목록으로 이동
        }
    } catch (error) {
        console.error('게시글 삭제 중 오류 발생:', error);
        alert('게시글 삭제에 실패했습니다.');
    }
};

// 목록 이동
const goToList = () => {
    if (!searchType?.trim() && !searchQuery?.trim()) {
        router.push('/team/post/view');
        return
    };
    router.push({
        path: "/team/post/view",
        query: {
            searchType: searchType,
            searchQuery: searchQuery
        }
    });
};

// 컴포넌트 마운트 시 데이터 로드
onMounted(async () => {
    await getPostDetail();
});
</script>

<style scoped>
/* 기존 스타일 유지 */

/* 수정 모드 스타일 */
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
