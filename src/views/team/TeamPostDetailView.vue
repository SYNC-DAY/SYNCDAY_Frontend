<template>
    <div class="post-detail-container">
        <!-- Header -->
        <div class="detail-header">
            <div class="team-container">
                <Button icon="pi pi-angle-double-left" 
                label="게시글 목록" 
                outlined
                style="margin-right:1rem"
                @click="goToList"/>
                <Button 
                    :label="teamStore.teamName"  
                    icon="pi pi-user" 
                    disabled 
                    rounded 
                    class="team-name-container"
                />- 
                <Button 
                    :label="teamStore.boardTitle"  
                    icon="pi pi-align-justify" 
                    disabled 
                    rounded 
                    class="board-name-container"
                />
            </div>
        </div>
        <!-- Body -->
        <div class="detail-body">
            <template v-if="!isEditMode">
                <div class="detail-up">
                    <h1 class="post-title">{{ post.title }}</h1>
                    <div class="post-meta">
                        <div class="author">작성자: {{ post.userName }}({{ post.userPosition }})</div>
                        <div class="date">작성일: {{ formatDate(post.createdAt) }}</div>
                        <div v-if="post.createdAt != post.updatedAt" class="date">
                            수정일: {{ formatDate(post.updatedAt) }}</div>
                        </div>
                    <div class="button-container">
                        <div v-if="isMyPost" class="my-post-button">
                            <Button outlined v-if="!isEditMode" @click="toggleEditMode">수정</Button>
                            <Button outlined @click="deletePost">삭제</Button>
                        </div>
                    </div>
                </div>
                <p class="content">
                    {{ post.content }}
                </p>
            </template>

            <template v-else>
                <input v-model="editedPost.title" class="edit-title" placeholder="제목을 입력하세요" />
                <Editor v-model="editedPost.content" editorStyle="height: 30rem">
                    <template v-slot:toolbar>
                        <span class="ql-formats">
                        </span>
                    </template>
                </Editor>
                <div class="edit-buttons">
                    <Button outlined v-if="isEditMode" @click="updatePost">수정 완료</Button>
                    <Button outlined v-if="isEditMode" @click="cancelEdit">취소</Button>
                </div>
            </template>
        </div>

        <!-- Footer -->
        <div class="detail-footer" v-if="!isEditMode">
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
import Editor from 'primevue/editor';


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

const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('ko-KR', options);
};

const removeHtmlTags = (html) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.innerText || tempElement.textContent; // HTML 태그 제거 후 텍스트 반환
};


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
    editedPost.value.content = removeHtmlTags(editedPost.value.content);
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
.detail-header{
    margin-bottom: 3rem;
}
.post-detail-container{
    display:flex;
    flex-direction: column;
    align-items: center;
    width:100%;
    height:100%;
    margin-top: 2rem;
}
.post-title{
    text-align: center;
}
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

.edit-buttons {
    text-align: right;
}

.detail-body{
    border: 1px solid #009688;
    border-radius: 2.5rem;
    box-shadow: 0 1.5px 3px rgba(59, 122, 63, 0.5);   
    padding: 2rem;
    width: 70vw;
}

.detail-footer {
    width: 70vw;
}

.team-name-container {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: #4DB6AC;
    border-color: #4DB6AC;
    cursor: default;
    color: black;
    opacity:1;
}
.board-name-container {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: #4DB6AC;
    border-color: #4DB6AC;
    cursor: default;
    color: black;
    opacity:1;
}

.post-meta{
    text-align: right;
}
.my-post-button{
    text-align: right;
}

.content{
    border-top: #009688 solid 1px;
    margin-top: 2rem;
    padding: 2rem;
    font-size: 1.2rem;
    line-height: 2; /* 줄 간격을 1.5배로 설정 */
}
</style>
