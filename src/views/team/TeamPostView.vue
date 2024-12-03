<template>
    <div class="board-container">
        <div class="team-name-container">
            {{ teamStore.teamName }} - {{ teamStore.boardTitle }}
            <Button @click="goToBoardView">게시판 목록으로 돌아가기</Button>
        </div>
        <div class="board-actions">
            <button @click="toCreateBoard" class="create-button">글 쓰기</button>

            <div class="search-bar">
                <select v-model="searchType">
                    <option value="TITLE">제목</option>
                    <option value="USER">작성자</option>
                    <option value="CONTENT">내용</option>
                </select>
                <input class="search-box"
                        type="text"
                        v-model="searchQuery" 
                        placeholder="검색어를 입력하세요"
                        @keyup.enter="search"
                        >
                <button @click="search" class="search-button" :disabled="!searchQuery.trim()">검색</button>
            </div>
            <div v-if="isSearchResult">
                <button @click="getPostList" class="back-button">전체글목록</button>
                <h1>검색결과</h1>
            </div>
        </div>
        <div class="board">
            <table class="board-table">
                <thead class="board-table-header">
                    <tr class="board-tr">
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>작성일</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(post, index) in postList.list" :key="post.teamPostId" class="board-tr">
                        <td>{{ postList.list.length - index }}</td>
                        <a 
                            href="javascript:void(0)" 
                            @click="toPostDetail(post.teamPostId, searchType, searchQuery)"
                        >
                            {{ post.title }} ({{ post.comments }})
                        </a>
                        <td>{{ post.userName }}({{ post.userPosition }})</td>
                        <td>{{ formatDate(post.createdAt) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
            <button @click="changePage(1)" :disabled="postList.isFirstPage">처음</button>
            <button @click="changePage(postList.prePage)" :disabled="!postList.hasPreviousPage">이전</button>

            <button
                v-for="page in postList.navigatepageNums"
                :key="page"
                :class="{ active: page === postList.pageNum }"
                @click="changePage(page)"
            >
                {{ page }}
            </button>

            <button @click="changePage(postList.nextPage)" :disabled="!postList.hasNextPage">다음</button>
            <button @click="changePage(postList.pages)" :disabled="postList.isLastPage">마지막</button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter} from 'vue-router';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useTeamStore } from '@/stores/team';

const route = useRoute();
const searchType = ref('TITLE');
const searchQuery = ref('');
const teamStore = useTeamStore();
const postList = ref({});
const pageNum = ref(1);
const isSearchResult = ref(false);
const router = useRouter();

// 게시글 리스트 가져오기
const getPostList = async (page = 1) => {
    isSearchResult.value =false;
    try {
        const response = await axios.get(`/teampost/${teamStore.boardId}`);
        postList.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch post list:', error);
    }
};

// 검색 기능
const search = async () => {
    isSearchResult.value = true;
    pageNum.value = 1; // 검색 시 페이지 번호 초기화
    try {
        const response = await axios.get(`/teampost/${teamStore.boardId}`, {
            params: {
                searchType: searchType.value,
                searchQuery: searchQuery.value,
            },
        });
        postList.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch post list:', error);
    }
};

// 페이징 처리
const changePage = async (page) => {
    if (page > 0 && page <= postList.value.pages) {
        pageNum.value = page;
        await getPostList(page);
    }
};

// 날짜 형식 변환 함수
const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleDateString('ko-KR', options);
};

const toCreateBoard = ()=>{
    router.push("/team/post/create");
};

const toPostDetail = (teamPostId, searchType, searchQuery) =>{
    if (searchQuery && searchQuery.trim() !== "") {
        teamStore.updatePostId(teamPostId);
        router.push({
        name: 'PostDetail',
        query: { searchType, searchQuery },
        });
        return
    }
    teamStore.updatePostId(teamPostId);
    router.push({
        name: 'PostDetail'
    });
};

const goToBoardView = ()=>{
    router.push("/team/board/view");
};
    

onMounted(async () => {
    const hasSearchParams =
        route.query.searchType?.trim() || route.query.searchQuery?.trim();

    if (hasSearchParams) {
        searchType.value = route.query.searchType || 'TITLE'; 
        searchQuery.value = route.query.searchQuery || ''; 
        await search(); 
    } else {
        await getPostList(); // 전체 게시글 목록 가져오기
    }
});

</script>

<style scoped>
.board-container {
    margin: 20px;
}

.board-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.create-button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
}

.search-bar {
    display: flex;
    gap: 10px;
}

.search-box {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.search-button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
}

.board-table {
    width: 100%;
    border-collapse: collapse;
}

.board-table th,
.board-table td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: center;
}

.pagination {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.pagination button {
    margin: 0 5px;
    padding: 5px 10px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: white;
    transition: background-color 0.3s, color 0.3s;
}

.pagination button.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
}

.pagination button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
