<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header Section -->
        <div class="flex flex-wrap items-center gap-4 mb-8">
            <Button icon="pi pi-angle-double-left" label="게시판 목록" severity="secondary" @click="goToBoardView" class="p-button-outlined" />
            <div class="flex gap-3">
                <Button :label="teamStore.teamName" icon="pi pi-users" severity="info" disabled class="p-button-rounded bg-teal-400 border-teal-400 text-gray-900" />
                <Button :label="teamStore.boardTitle" icon="pi pi-list" severity="info" disabled class="p-button-rounded bg-teal-400 border-teal-400 text-gray-900" />
            </div>
        </div>

        <!-- Search & Actions Section -->
        <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div class="flex items-center gap-3">
                <Select v-model="searchType" :options="searchTypes" optionLabel="name" placeholder="검색 유형" class="w-48" />
                <span class="p-input-icon-left w-64">
                    <i class="pi pi-search" />
                    <InputText v-model="searchQuery" placeholder="검색어를 입력하세요" class="w-full" @keyup.enter="search" />
                </span>
                <Button icon="pi pi-search" @click="search" :disabled="!searchQuery.trim()" severity="info" class="p-button-outlined" />
            </div>
            <div class="flex gap-3">
                <Button
                    v-if="isSearchResult"
                    icon="pi pi-list"
                    label="전체글목록"
                    @click="
                        getPostList();
                        resetSearch();
                    "
                    severity="secondary"
                    class="p-button-outlined"
                />
                <Button v-if="!isSearchResult" icon="pi pi-plus" label="글 쓰기" @click="toCreateBoard" severity="success" class="p-button-outlined" />
            </div>
        </div>

        <!-- Posts Table -->
        <Card class="mb-6">
            <DataTable :value="postList.list" stripedRows class="p-datatable-sm" @row-click="goToPost" v-model:selection="selectedPost" selectionMode="single" dataKey="teamPostId" :rowHover="true">
                <Column field="title" header="제목" class="w-5/12">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <span>{{ data.title }}</span>
                            <Badge v-if="data.comments > 0" :value="data.comments" severity="info" />
                        </div>
                    </template>
                </Column>
                <Column field="userName" header="작성자" class="w-2/12" />
                <Column field="userPosition" header="직책" class="w-2/12" />
                <Column field="createdAt" header="작성시각" class="w-3/12" />
            </DataTable>
        </Card>

        <!-- Pagination -->
        <div class="flex justify-center gap-2">
            <Button icon="pi pi-angle-double-left" @click="changePage(1)" :disabled="postList.isFirstPage" class="p-button-outlined p-button-sm" />
            <Button icon="pi pi-angle-left" @click="changePage(postList.prePage)" :disabled="!postList.hasPreviousPage" class="p-button-outlined p-button-sm" />

            <Button v-for="page in postList.navigatepageNums" :key="page" :label="String(page)" :class="['p-button-outlined p-button-sm', { 'bg-teal-500 text-white': page === postList.pageNum }]" @click="changePage(page)" />

            <Button icon="pi pi-angle-right" @click="changePage(postList.nextPage)" :disabled="!postList.hasNextPage" class="p-button-outlined p-button-sm" />
            <Button icon="pi pi-angle-double-right" @click="changePage(postList.pages)" :disabled="postList.isLastPage" class="p-button-outlined p-button-sm" />
        </div>
    </div>
</template>
<script setup>
    import { useTeamStore } from '@/stores/team';
    import axios from 'axios';
    import { InputText, Select } from 'primevue';
    import { onMounted, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';

    const route = useRoute();
    const searchType = ref({ option: 'TITLE', name: '제목' });
    const searchQuery = ref('');
    const teamStore = useTeamStore();
    const postList = ref({});
    const pageNum = ref(1);
    const isSearchResult = ref(false);
    const router = useRouter();
    const searchTypes = [
        {
            option: 'TITLE',
            name: '제목'
        },
        {
            option: 'CONTENT',
            name: '내용'
        },
        {
            option: 'USER',
            name: '작성자'
        }
    ];

    // 게시글 리스트 가져오기
    const getPostList = async (page = 1) => {
        isSearchResult.value = false;
        try {
            const response = await axios.get(`/teampost/${teamStore.boardId}?page=${page}`);
            postList.value = response.data.data;
            postList.value.list = postList.value.list.map((post) => ({
                ...post,
                createdAt: formatDate(post.createdAt)
            }));
        } catch (error) {
            console.error('Failed to fetch post list:', error);
        }
    };

    const goToPost = (event) => {
        const post = event.data;
        console.log(post);
        teamStore.updateBoardId(post.teamBoardId);
        teamStore.updatePostId(post.teamPostId);
        router.push('/team/post/detail/view');
    };
    // 검색 기능
    const search = async () => {
        isSearchResult.value = true;
        pageNum.value = 1; // 검색 시 페이지 번호 초기화
        try {
            const response = await axios.get(`/teampost/${teamStore.boardId}`, {
                params: {
                    searchType: searchType.value.option,
                    searchQuery: searchQuery.value
                }
            });
            postList.value = response.data.data;
            postList.value.list = postList.value.list.map((post) => ({
                ...post,
                createdAt: formatDate(post.createdAt)
            }));
        } catch (error) {
            console.error('Failed to fetch post list:', error);
        }
    };

    // 페이징 처리
    const changePage = async (page) => {
        if (page > 0 && page <= postList.value.pages) {
            pageNum.value = page;
            console.log('page:', page);
            await getPostList(page);
        }
    };

    // 날짜 형식 변환 함수
    const formatDate = (date) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return new Date(date).toLocaleDateString('ko-KR', options);
    };

    const toCreateBoard = () => {
        router.push('/team/post/create');
    };

    const resetSearch = () => {
        searchQuery.value = '';
        searchType.value = { option: 'TITLE', name: '제목' };
    };

    const toPostDetail = (teamPostId, searchType, searchQuery) => {
        if (searchQuery && searchQuery.trim() !== '') {
            teamStore.updatePostId(teamPostId);
            router.push({
                name: 'PostDetail',
                query: { searchType, searchQuery }
            });
            return;
        }
        teamStore.updatePostId(teamPostId);
        router.push({
            name: 'PostDetail'
        });
    };

    const goToBoardView = () => {
        router.push('/team/board/view');
    };

    onMounted(async () => {
        const hasSearchParams = route.query.searchType?.trim() || route.query.searchQuery?.trim();

        if (hasSearchParams) {
            searchType.value = route.query.searchType || 'TITLE';
            searchQuery.value = route.query.searchQuery || '';
            await search();
        } else {
            await getPostList(); // 전체 게시글 목록 가져오기
        }
    });
</script>
