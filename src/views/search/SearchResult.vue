<template>
  <div class="search-container">
    <!-- 뒤로가기 및 검색어 표시 -->
    <div class="search-header">
      <RouterLink to="/" class="back-button">
        <i class="pi pi-arrow-left"></i> 뒤로가기
      </RouterLink>
      <h1 class="search-title">
        <span class="highlight">"{{ route.query.keyword }}"</span> 검색 결과
      </h1>
    </div>

    <!-- 로딩 표시 -->
    <div v-if="isLoading" class="loading">
      <i class="pi pi-spinner pi-spin"></i>
      검색 중...
    </div>

    <!-- 필터 버튼 -->
    <div class="filter-buttons">
      <button
          v-for="filter in filters"
          :key="filter.id"
          :class="['filter-btn', { active: currentFilter === filter.id }]"
          @click="currentFilter = filter.id"
      >
        <i :class="filter.icon"></i>
        {{ filter.name }}
        <span class="count">({{ resultCounts[filter.id] || 0 }})</span>
      </button>
    </div>

    <!-- 검색 결과 -->
    <div class="search-results">
      <div v-if="filteredResults.length > 0">
        <div v-for="result in filteredResults" :key="result.id" class="result-item">
          <component
              :is="getResultComponent(result.type)"
              :result="result"
              @click="handleResultClick(result)"
          />
        </div>
      </div>
      <div v-else-if="!isLoading" class="no-results">
        검색 결과가 없습니다.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from "@/stores/auth.js";
import axios from 'axios';

// 도메인별 결과 컴포넌트 import
import ProjectSearch from "@/views/search/components/ProjectSearch.vue";
import WorkspaceSearch from './components/WorkspaceSearch.vue';
// import CardboardResult from './components/CardboardResult.vue';
// import CardResult from './components/CardResult.vue';
// import CommentResult from './components/CommentResult.vue';
// import ChatResult from './components/ChatResult.vue';
// import FileResult from './components/FileResult.vue';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const currentFilter = ref('all');
const isLoading = ref(false);
const searchResults = ref([]);

// 도메인별 컴포넌트 매핑
const getResultComponent = (type) => {
  const components = {
    'projects': ProjectSearch,
    'workspace': WorkspaceSearch,
    // 'cardboard': CardboardResult,
    // 'card': CardResult,
    // 'comments': CommentResult,
    // 'chats': ChatResult,
    // 'files': FileResult
  };
  return components[type];
};

// 결과 클릭 핸들러
const handleResultClick = (result) => {
  const routes = {
    'projects': `/projects/${result.projectId}`,
    'workspace': `/workspace/${result.workspaceId}`,
    'cardboard': `/cardboard/${result.boardId}`,
    'card': `/card/${result.cardId}`,
    'comments': `/comments/${result.commentId}`,
    'chats': `/chats/${result.chatId}`,
    'files': `/files/${result.fileId}`
  };

  if (routes[result.type]) {
    router.push(routes[result.type]);
  }
};

// 필터 옵션 정의
const filters = [
  { id: 'all', name: '전체 결과', icon: 'pi pi-list' },
  { id: 'projects', name: '프로젝트', icon: 'pi pi-folder' },
  { id: 'workspace', name: '워크스페이스', icon: 'pi pi-share-alt' },
  { id: 'cardboard', name: '카드보드', icon: 'pi pi-credit-card' },
  { id: 'card', name: '카드', icon: 'pi pi-th-large' },
  { id: 'comments', name: '댓글', icon: 'pi pi-comments' },
  { id: 'chats', name: '채팅', icon: 'pi pi-comment' },
  { id: 'files', name: '파일', icon: 'pi pi-file' }
];

// 검색 결과를 도메인별로 저장
const domainResults = ref({
  projects: [],
  workspace: [],
  cardboard: [],
  card: [],
  comments: [],
  chats: [],
  files: []
});

// API 엔드포인트 설정
const API_ENDPOINTS = {
  projects: '/projs/search',
  workspace: '/workspaces/search',
  // cardboard: '/cardboard/search',
  // card: '/card/search',
  // comments: '/comments/search',
  // chats: '/chats/search',
  // files: '/files/search'
};

// 검색 수행 함수
const performSearch = async (keyword) => {
  if (!keyword) return;

  isLoading.value = true;

  try {
    const searchPromises = Object.entries(API_ENDPOINTS).map(([domain, endpoint]) => {
      return axios.get(endpoint, {
        params: {
          keyword: keyword
        }
      })
          .then(response => {
            domainResults.value[domain] = response.data.data.map(item => ({
              ...item,
              type: domain
            }));
            console.log("response.data.data: ", response.data.data);
            return response.data.data;
          })
          .catch(error => {
            console.error(`${domain} 검색 오류:`, error);
            return [];
          });
    });

    await Promise.all(searchPromises);
    searchResults.value = Object.values(domainResults.value).flat();

  } catch (error) {
    console.error('검색 중 오류 발생:', error);
  } finally {
    isLoading.value = false;
  }
};

// route의 query parameter가 변경될 때마다 검색 수행
watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) {
    performSearch(newKeyword);
  } else {
    searchResults.value = [];
  }
});

// 필터링된 결과 계산
const filteredResults = computed(() => {
  if (currentFilter.value === 'all') {
    return searchResults.value;
  }
  return searchResults.value.filter(item => item.type === currentFilter.value);
});

// 각 도메인별 결과 개수 계산
const resultCounts = computed(() => {
  return {
    all: searchResults.value.length,
    ...Object.fromEntries(
        Object.keys(domainResults.value).map(domain => [
          domain,
          domainResults.value[domain].length
        ])
    )
  };
});

onMounted(() => {
  if (route.query.keyword) {
    performSearch(route.query.keyword);
  }
});
</script>

<style scoped>
.search-container {
  padding: 2rem 4rem;
  max-width: 100%;
  margin: 0 auto;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 0 2rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #666;
}

.search-title {
  font-size: 1.5rem;
  font-weight: 500;
}

.highlight {
  font-size: x-large;
  color: #1a73e8;
}

.filter-buttons {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 20px;
  cursor: pointer;
  color: #666;
}

.filter-btn:hover {
  background-color: #f5f5f5;
}

.filter-btn.active {
  background-color: #1a73e8;
  color: white;
}

.count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.search-results {
  width: 100%;
  padding: 0 2rem;
}

.result-item {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.result-content h3 {
  margin-bottom: 0.5rem;
  color: #1a73e8;
}

.result-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: #666;
}

.loading i {
  font-size: 1.5rem;
  color: #1a73e8;
}
</style>