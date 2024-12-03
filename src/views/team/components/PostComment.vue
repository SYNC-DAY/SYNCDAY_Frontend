<template> 
    <div>
        <h4>댓글({{ commentNum }})</h4>
        <!-- 댓글 작성 -->
        <div class="comment-input-container">
            <textarea 
                v-model="newComment" 
                placeholder="댓글을 입력하세요" 
                class="comment-input"
            ></textarea>
            <button @click="submitComment" class="submit-button">댓글 작성</button>
        </div>

        <!-- 댓글 목록 -->
        <div v-if="commentList.length > 0">
            <ul>
                <li v-for="comment in commentList" :key="comment.teamCommentId">
                    <div class="comment">
                        <!-- 수정 모드 -->
                        <div v-if="editCommentId === comment.teamCommentId" class="edit-comment">
                            <textarea 
                                v-model="editedComment" 
                                placeholder="댓글을 수정하세요"
                            ></textarea>
                            <button @click="updateComment">수정 완료</button>
                            <button @click="cancelEdit">취소</button>
                        </div>

                        <!-- 일반 모드 -->
                        <div v-else>
                            <div class="comment-content">
                                <p class="content">{{ comment.content }}</p>
                                <p class="meta">
                                    작성자: {{ comment.userName }}({{ comment.userPosition }}) | 작성일: {{ formatDate(comment.createdAt) }}
                                </p>
                            </div>
                            <!-- 수정/삭제 버튼 -->
                            <div v-if="authStore.user.userId === comment.userId" class="comment-buttons">
                                <button @click="startEditComment(comment)">수정</button>
                                <button @click="deleteComment(comment.teamCommentId)">삭제</button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>

            <!-- 페이징 버튼 -->
            <div class="pagination">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">이전</button>
                <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">다음</button>
            </div>
        </div>
        <div v-else>
            <p>댓글이 없습니다.</p>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useTeamStore } from '@/stores/team';
import { useAuthStore } from '@/stores/auth';

const teamStore = useTeamStore();
const authStore = useAuthStore();

const commentList = ref([]); // 댓글 리스트
const commentNum = ref(0);
const newComment = ref(''); // 새 댓글 작성 내용
const editCommentId = ref(null); // 수정 중인 댓글 ID
const editedComment = ref(''); // 수정 중인 댓글 내용

const currentPage = ref(1); // 현재 페이지
const pageSize = ref(5); // 한 페이지에 표시할 댓글 수
const totalPages = ref(1); // 총 페이지 수

// 댓글 목록 가져오기
const getComment = async () => {
    try {
        const response = await axios.get(`/teamcomment/${teamStore.postId}`, {
            params: {
                page: currentPage.value,
                pageSize: pageSize.value,
            },
        });
        const data = response.data.data;
        commentList.value = data.list; // 댓글 리스트 설정
        totalPages.value = data.pages; // 총 페이지 수
        commentNum.value = data.total;
    } catch (error) {
        console.error('댓글 데이터를 불러오는 중 오류 발생:', error);
    }
};

// 페이지 변경
const changePage = async (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page; // 페이지 번호 업데이트
    await getComment(); // 새 페이지 댓글 가져오기
};

// 댓글 작성
const submitComment = async () => {
    if (!newComment.value.trim()) {
        alert('댓글 내용을 입력하세요!');
        return;
    }

    try {
        const response = await axios.post('/teamcomment', {
            content: newComment.value,
            teamPostId: teamStore.postId,
            userId: authStore.user.userId,
        });

        if (response.data.success) {
            alert('댓글이 작성되었습니다.');
            newComment.value = ''; // 입력 필드 초기화
            currentPage.value = 1; // 첫 페이지로 이동
            await getComment(); // 댓글 목록 다시 불러오기
        }
    } catch (error) {
        console.error('댓글 작성 중 오류 발생:', error);
        alert('댓글 작성에 실패했습니다.');
    }
};

// 댓글 수정 시작
const startEditComment = (comment) => {
    editCommentId.value = comment.teamCommentId; // 수정할 댓글 ID 설정
    editedComment.value = comment.content; // 기존 댓글 내용 가져오기
};

// 댓글 수정 완료
const updateComment = async () => {
    if (!editedComment.value.trim()) {
        alert('수정할 댓글 내용을 입력하세요!');
        return;
    }

    try {
        const response = await axios.put(`/teamcomment/${editCommentId.value}`, {
            content: editedComment.value,
        });

        if (response.data.success) {
            alert('댓글이 수정되었습니다.');
            editCommentId.value = null; // 수정 상태 해제
            editedComment.value = ''; // 입력 필드 초기화
            await getComment(); // 댓글 목록 다시 불러오기
        }
    } catch (error) {
        console.error('댓글 수정 중 오류 발생:', error);
        alert('댓글 수정에 실패했습니다.');
    }
};

// 댓글 수정 취소
const cancelEdit = () => {
    editCommentId.value = null; // 수정 상태 해제
    editedComment.value = ''; // 입력 필드 초기화
};

// 댓글 삭제
const deleteComment = async (commentId) => {
    if (!confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;

    try {
        const response = await axios.delete(`/teamcomment/${commentId}`);

        if (response.data.success) {
            alert('댓글이 삭제되었습니다.');
            await getComment(); // 댓글 목록 다시 불러오기
        }
    } catch (error) {
        console.error('댓글 삭제 중 오류 발생:', error);
        alert('댓글 삭제에 실패했습니다.');
    }
};

// 날짜 형식 변환 함수
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options);
};

// 초기 댓글 데이터 로드
onMounted(async () => {
    await getComment();
});
</script>

<style scoped>
.comment {
    border-bottom: 1px solid #ddd;
    padding: 10px 0;
}

.comment-content {
    margin-bottom: 5px;
}

.meta {
    font-size: 12px;
    color: #666;
}

.comment-input-container {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.comment-input {
    width: 100%;
    height: 80px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    resize: none;
}

.comment-buttons button {
    margin-right: 5px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
}

.pagination button {
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;
    border-radius: 4px;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.edit-comment textarea {
    width: 100%;
    height: 60px;
    margin-bottom: 10px;
}
</style>
