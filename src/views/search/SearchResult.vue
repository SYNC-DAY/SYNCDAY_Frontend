<template>
  <div class="ph-1rem container-col width-100">
    <!-- 검색 헤더 -->
    <div class="workspace-header container-row underline-gray">
      <div class="container-row">
        <RouterLink to="/" class="back-button">
          <i class="pi pi-arrow-left"></i> 뒤로가기
        </RouterLink>
        <h1 class="search-title">
          <span class="highlight">"{{ route.query.keyword }}"</span> 검색 결과
        </h1>
      </div>
    </div>
    <!-- 도메인 필터 버튼 -->
    <div class="filter-container">
      <button v-for="filter in filters" :key="filter.id"
        :class="['filter-btn', { active: currentFilter === filter.id }]" @click="currentFilter = filter.id">
        <i :class="filter.icon"></i>
        {{ filter.name }}
        <span class="count">({{ resultCounts[filter.id] || 0 }})</span>
      </button>
    </div>
    <!-- 메인 컨텐츠 영역 -->
    <div class="search-results-container">
      <!-- 왼쪽: 검색 결과 영역 -->
      <div class="results-area">
        <!-- 검색 결과 표시 영역 -->
        <div class="results-panel">
          <div v-if="filteredAndSortedResults.length > 0">
            <!-- 전체 결과 모드 -->
            <div v-if="currentFilter === 'all'">
              <div v-for="domain in domains" :key="domain">
                <div v-if="domainResults[domain]?.length > 0" class="domain-section">
                  <div class="domain-header">
                    <h2>
                      {{ getDomainTitle(domain) }}
                      <span class="domain-count">{{ domainResults[domain].length }}</span>
                    </h2>
                    <button v-if="domainResults[domain].length > 5" @click="showMore(domain)" class="more-button">
                      더보기 →
                    </button>
                  </div>
                  <div v-for="result in limitedResults(domain)" :key="result.id" class="result-item">
                    <component :is="getResultComponent(result.type)" :result="result"
                      @click="handleResultClick(result)" />
                  </div>
                </div>
              </div>
            </div>
            <!-- 특정 도메인 결과 모드 -->
            <div v-else class="domain-section">
              <div class="domain-header">
                <h2>
                  {{ getDomainTitle(currentFilter) }}
                  <span class="domain-count">{{ domainResults[currentFilter]?.length }}</span>
                </h2>
              </div>
              <div v-for="result in filteredAndSortedResults" :key="result.id" class="result-item">
                <component :is="getResultComponent(result.type)" :result="result" @click="handleResultClick(result)" />
              </div>
            </div>
          </div>
          <div v-else-if="!isLoading" class="no-results">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <!-- 오른쪽: 사이드 필터 -->
      <div class="side-filter">
        <div class="filter-section">
          <h3 class="pi pi-filter" style="font-weight: bold;">
            정렬 순서
            <button class="filter-reset" @click="resetAllFilters">
              <i class="pi pi-refresh"></i>
              초기화
            </button>
          </h3>
          <div class="filter-options">
            <button :class="['filter-btn', { active: sortOrder === 'latest' }]" @click="sortOrder = 'latest'">
              <i class="pi pi-sort-amount-down"></i>
              최신순
            </button>
            <button :class="['filter-btn', { active: sortOrder === 'oldest' }]" @click="sortOrder = 'oldest'">
              <i class="pi pi-sort-amount-up"></i>
              오래된 순
            </button>
          </div>
        </div>

        <div class="filter-section">
          <h3 class="pi pi-calendar" style="font-weight: bold;">검색 기간</h3>
          <div class="filter-options">
            <button v-for="period in periods" :key="period.value"
              :class="['filter-btn', { active: selectedPeriod === period.value }]"
              @click="selectedPeriod = period.value">
              {{ period.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSearch } from './useSearch';
import ProjectSearch from "./components/ProjectSearch.vue";
import WorkspaceSearch from './components/WorkspaceSearch.vue';
import CardboardSearch from './components/CardboardSearch.vue';
import CardSearch from './components/CardSearch.vue';

const route = useRoute();
const router = useRouter();

const {
  currentFilter,
  isLoading,
  sortOrder,
  selectedPeriod,
  filters,
  domains,
  periods,
  domainResults,
  filteredAndSortedResults,
  resultCounts,
  performSearch,
  limitedResults,
  getDomainTitle,
  showMore,
  resetAllFilters
} = useSearch();

// 도메인별 컴포넌트 매핑
const getResultComponent = (type) => ({
  'projects': ProjectSearch,
  'workspace': WorkspaceSearch,
  'cardboard': CardboardSearch,
  'card': CardSearch,
}[type]);

// 결과 클릭 핸들러
const handleResultClick = (result) => {
  const routes = {
    'projects': `/project/${result.projectId}`,
    'workspace': `/project/${result.projectId}/workspace/${result.workspaceId}`,
    'cardboard': {
      name: 'Workspace',
      params: {
        projectId: result.projectId,
        workspaceId: result.workspaceId
      },
      query: { view: '0' }
    },
    'card': {
      name: 'Workspace',
      params: {
        projectId: result.projectId,
        workspaceId: result.workspaceId
      },
      query: {
        view: '0',
        cardId: result.cardId
      }
    }
  };

  router.push(routes[result.type]);
};

watch(() => route.query.keyword, (newKeyword) => {
  if (newKeyword) performSearch(newKeyword);
});

onMounted(() => {
  if (route.query.keyword) performSearch(route.query.keyword);
});
</script>

<style scoped>
/* 기본 리셋 */
button {
  all: unset;
  box-sizing: border-box;
}

.search-results-container {
  display: flex;
  gap: 5rem;
  position: relative;
  margin-top: 1rem;
  margin-left: 3rem;
  /* 좌우 margin auto로 중앙 정렬 */
  padding-right: 2rem;
  /* 오른쪽 여백 추가 */
  padding-left: 2rem;
  /* 왼쪽 여백 추가 */
}

.ph-1rem {
  padding: 0 clamp(0.5rem, 3vw, 2rem);
}

.container-col {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.container-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.width-100 {
  width: 100%;
}

/* 결과 영역 너비 제한 */
.results-area {
  flex: 1;
  max-width: 65%;
  overflow: hidden;
}

/* 헤더 영역 */
.workspace-header {
  margin-left: 3rem;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #666;
}

.search-title {
  font-size: clamp(1rem, 2vw, 1.5rem);
}

.highlight {
  font-size: clamp(1.2rem, 2.5vw, 2rem);
  color: #FE5D86;
}

/* 도메인 필터 버튼 컨테이너는 전체 너비 사용 */
.filter-container {
  margin-left: 3rem;
  width: 100%;
  padding: clamp(0.5rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 1.25rem;
  cursor: pointer;
  color: #666;
  transition: background-color 0.2s;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  min-height: 2.7rem;
  box-sizing: border-box;
}

.filter-btn:hover {
  background-color: rgba(26, 115, 232, 0.1);
}

.filter-btn.active {
  background-color: #FE5D86;
  color: white;
}

.filter-btn.active:hover {
  background-color: #FE5D86;
  color: white;
}

.count {
  font-size: clamp(0.75rem, 1.2vw, 0.875rem);
  opacity: 0.8;
}

/* 사이드 필터 위치 조정 */
.side-filter {
  width: 18rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: sticky;
  top: 1rem;
  border: 1px solid #eee;
  margin-top: 0;
  /* 상단 여백 제거 */
}

.filter-section {
  margin-bottom: 2rem;
}

.filter-section h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-left: 0.5rem;
}

.filter-options .filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #666;
  width: 50%;
  transition: all 0.2s;
}

.filter-options .filter-btn:hover {
  background-color: rgba(26, 115, 232, 0.1);
}

.filter-options .filter-btn.active {
  background-color: #FE5D86;
  color: white;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.filter-options label {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.filter-options label:hover {
  background-color: #f5f5f5;
}

/* 초기화 버튼 스타일 */
.filter-reset {
  padding: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: auto;
}

.filter-reset:hover {
  color: #FE5D86;
}

/* 결과 패널 */
.results-panel {
  height: calc(100vh - 15rem);
  /* 상단 여백 고려하여 조정 */
  overflow-y: auto;
}

/* 도메인 섹션 */
.domain-section {
  margin-bottom: 2rem;
  border: 1px solid #eee;
  border-radius: 0.5rem;
  padding: 1rem;
  
}

.domain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  min-height: 3rem;
}

.domain-header h2 {
  margin: 0;
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  color: #333;
}

.domain-count {
  color: #FE5D86;
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  margin-left: 0.2rem;
}

/* 결과 아이템 */
.result-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
  width: 100%;
}

.result-header h3 {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: #FE5D86;
  margin: 0;
}

/* 로딩 & 에러 상태 */
.loading,
.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i {
  font-size: 1.5rem;
  color: #1a73e8;
}

/* 더보기 버튼 */
.more-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #FE5D86;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
  font-size: clamp(0.875rem, 1.5vw, 1rem);
}

.more-button:hover {
  opacity: 0.8;
}

/* 메타 정보 */
.result-meta {
  display: flex;
  gap: 1rem;
  color: #666;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  margin-top: 0.5rem;
}

.result-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15.625rem, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* 메타 레이블과 값 */
.meta-label {
  color: #666;
  white-space: nowrap;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
}

.meta-value {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
}

/* 날짜 표시 */
.result-date {
  color: #666;
  font-size: clamp(0.8rem, 1.4vw, 0.9rem);
  margin: 0.5rem 0;
}

/* 아이콘 스타일링 */
.result-header i {
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  color: #666;
}
</style>