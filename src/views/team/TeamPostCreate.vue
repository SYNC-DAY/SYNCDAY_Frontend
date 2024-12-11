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
                />
                <Button 
                    :label="teamStore.boardTitle"  
                    icon="pi pi-user" 
                    disabled 
                    rounded 
                    class="board-name-container"
                />
            </div>
        </div>
        <!-- Body -->
        <div class="detail-body">
            <div class="detail-up">
                <InputText class="title-input" v-model="newPost.title"/>
                <div class="button-container">
                    <!-- <Toast/> -->
                    <Button outlined @click="goToList">취소</Button>
                    <!-- <Toast/> -->
                    <Button outlined @click="submitPost">작성</Button>
                </div>
            </div>
            <Editor v-model="newPost.content" editorStyle="height: 30rem">
                <template v-slot:toolbar>
                    <span class="ql-formats">
                    </span>
                </template>
            </Editor>
        </div>

    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { InputText } from 'primevue';
import Editor from 'primevue/editor';
import { useToast } from 'primevue/usetoast';

const teamStore = useTeamStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const newPost = ref({
    title: '',
    content: '',
});

const removeHtmlTags = (html) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.innerText || tempElement.textContent; // HTML 태그 제거 후 텍스트 반환
};

// 게시글 작성 완료
const submitPost = async () => {
    if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
        // alert('제목과 내용을 입력해주세요!');
        toast.add({
        severity: "warn",
        summary: "제목 및 내용",
        detail: "제목과 내용을 입력해주세요!",
        life: 3000,
        });
        return;
    }

    try {
        newPost.value.content = removeHtmlTags(newPost.value.content);
        const response = await axios.post('/teampost', {
            title: newPost.value.title,
            content: newPost.value.content,
            userId: authStore.user.userId,
            teamBoardId: teamStore.boardId,
        });

        if (response.data.success) {
            // alert('게시글이 작성되었습니다.');
            toast.add({
            severity: "success",
            summary: "게시글 작성",
            detail: "게시글이 작성되었습니다.",
            life: 3000,
            });
            router.push('/team/post/view'); // 목록 페이지로 이동
        }
    } catch (error) {
        console.error('게시글 작성 중 오류 발생:', error);
        // alert('게시글 작성에 실패했습니다.');
        toast.add({
            severity: "error",
            summary: "게시글 작성 실패",
            detail: "게시글 작성 중 오류가 발생하였습니다.",
            life: 3000,
        });
    }
};

// 목록 이동
const goToList = () => {
    router.push('/team/post/view');
};
</script>

<style scoped>
/* 기존 스타일 유지 */

/* 수정 모드 스타일 */

.title-input{
    width: 50vw;
}

.detail-up{
    display: flex;
    justify-content: space-between;
}

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

.button-container {
    display: flex;
    gap: 3px;
}
</style>
