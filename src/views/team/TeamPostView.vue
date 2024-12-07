<template>
    <div class="board-container">
        <div class="team-container">
            <Button 
                :label="teamStore.teamName"  
                icon="pi pi-user" 
                disabled 
                rounded 
                class="team-name-container"
            />- 
            <Button 
                :label="teamStore.boardTitle"  
                icon="pi pi-user" 
                disabled 
                rounded 
                class="board-name-container"
            />
            <Button @click="goToBoardView">게시판 목록으로 돌아가기</Button>
        </div>
        <div class="board-actions">
            <Button @click="toCreateBoard" class="create-Button">글 쓰기</Button>

            <div class="search-bar">
                <Select v-model="searchType" 
                :options="searchTypes" 
                optionLabel="name" 
                placeholder="---"
                class="w-full md:w-56" />
                <IconField>
                    <InputIcon class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="검색어를 입력하세요"
                    @keyup.enter="search" />
                </IconField>
                <Button @click="search" class="search-Button" :disabled="!searchQuery.trim()">검색</Button>
            </div>
            <div v-if="isSearchResult">
                <Button @click="getPostList" class="back-Button">전체글목록</Button>
                <h1>검색결과</h1>
            </div>
        </div>
        <div class="board">
            <DataTable
                class="board-table" :value="postList.list" 
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

        <!-- Pagination -->
        <div class="pagination">
            <Button @click="changePage(1)" :disabled="postList.isFirstPage">처음</Button>
            <Button @click="changePage(postList.prePage)" :disabled="!postList.hasPreviousPage">이전</Button>

            <Button
                v-for="page in postList.navigatepageNums"
                :key="page"
                :class="{ active: page === postList.pageNum }"
                @click="changePage(page)"
            >
                {{ page }}
            </Button>

            <Button @click="changePage(postList.nextPage)" :disabled="!postList.hasNextPage">다음</Button>
            <Button @click="changePage(postList.pages)" :disabled="postList.isLastPage">마지막</Button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter} from 'vue-router';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useTeamStore } from '@/stores/team';
import { IconField,InputIcon, InputText, Select } from 'primevue';

const route = useRoute();
const searchType = ref('TITLE');
const searchQuery = ref('');
const teamStore = useTeamStore();
const postList = ref({});
const pageNum = ref(1);
const isSearchResult = ref(false);
const router = useRouter();
const searchTypes = [
{
    option:"TITLE",
    name:"제목"
    },    
    {
    option:"CONTENT",
    name:"내용"
    },
    {
    option:"USER",
    name:"작성자"
    },
];

// 게시글 리스트 가져오기
const getPostList = async (page = 1) => {
    isSearchResult.value =false;
    try {
        const response = await axios.get(`/teampost/${teamStore.boardId}?page=${page}`);
        postList.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch post list:', error);
    }
};

const goToPost = (event) => {
    const post = event.data;
    console.log(post)
    teamStore.updateBoardId(post.teamBoardId);
    teamStore.updatePostId(post.teamPostId);
    router.push("/team/post/detail/view");
}
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
        console.log("page:",page)
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
.team-name-container {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: #FDC387;
    border-color: #FDC387;
    cursor: default;
    color: black;
    opacity:1;
}
.board-name-container {
    margin-top: 1rem;
    margin-right: 1rem;
    background-color: #FDC387;
    border-color: #FDC387;
    cursor: default;
    color: black;
    opacity:1;
}
.board-container {
    margin: 20px;
}

.board-actions {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
}

.create-Button {
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

.search-Button {
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

.pagination Button {
    margin: 0 5px;
    padding: 5px 10px;
    cursor: pointer;
    border: 1px solid #ccc;
    background-color: white;
    transition: background-color 0.3s, color 0.3s;
    color:black;
}

.pagination Button.active {
    background-color: #007bff;
    color: white;
    font-weight: bold;
}

.pagination Button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
