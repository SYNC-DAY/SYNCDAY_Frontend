// composables/useSearch.js
import { ref, computed } from "vue";
import axios from "axios";

export function useSearch() {
  const searchResults = ref([]);
  const currentFilter = ref("all");
  const isLoading = ref(false);
  const sortOrder = ref("latest");
  const selectedPeriod = ref("all");

  // 도메인 관련 상수
  const filters = [
    { id: "all", name: "전체 결과", icon: "pi pi-list" },
    { id: "projects", name: "프로젝트", icon: "pi pi-folder" },
    { id: "workspace", name: "워크스페이스", icon: "pi pi-share-alt" },
    { id: "cardboard", name: "카드보드", icon: "pi pi-credit-card" },
    { id: "card", name: "카드", icon: "pi pi-th-large" },
    { id: "comments", name: "댓글", icon: "pi pi-comment" },
    { id: "chats", name: "채팅", icon: "pi pi-comments" },
    { id: "files", name: "파일", icon: "pi pi-file" },
  ];

  const domains = [
    "projects",
    "workspace",
    "cardboard",
    "card",
    "comments",
    "chats",
    "files",
  ];

  // API 엔드포인트 설정
  const API_ENDPOINTS = {
    projects: "/projs/search",
    workspace: "/workspaces/search",
    cardboard: "/cardboards/search",
    // card: '/cards/search',
    // comments: '/comments/search',
    // chats: '/chats/search',
    // files: '/files/search'
  };

  const periods = [
    { value: "all", label: "전체" },
    { value: "today", label: "오늘" },
    { value: "week", label: "일주일" },
    { value: "month", label: "1개월" },
    { value: "sixMonths", label: "6개월" },
  ];

  const domainResults = ref({
    projects: [],
    workspace: [],
    cardboard: [],
    card: [],
    comments: [],
    chats: [],
    files: [],
  });

  // 검색 수행 함수
  const performSearch = async (keyword) => {
    if (!keyword) return;
    isLoading.value = true;
    try {
      const searchPromises = Object.entries(API_ENDPOINTS).map(
        ([domain, endpoint]) => {
          return axios
            .get(endpoint, { params: { keyword } })
            .then((response) => {
              domainResults.value[domain] = response.data.data.map((item) => ({
                ...item,
                type: domain,
              }));
              return response.data.data;
            })
            .catch((error) => {
              console.error(`${domain} 검색 오류:`, error);
              return [];
            });
        }
      );

      await Promise.all(searchPromises);
      searchResults.value = Object.values(domainResults.value).flat();
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const filteredAndSortedResults = computed(() => {
    let results =
      currentFilter.value === "all"
        ? searchResults.value
        : searchResults.value.filter(
            (item) => item.type === currentFilter.value
          );

    console.log("Initial results:", results); // 초기 결과 확인
    console.log("Sort order:", sortOrder.value); // 현재 정렬 순서 확인

    // 정렬 부분에서 실제 데이터 구조 확인
    console.log("Sample data for sorting:", {
      a: results[0]?.createdAt,
      b: results[1]?.createdAt,
    });

    // 기간 필터링
    if (selectedPeriod.value !== "all") {
      const now = new Date();
      const periods = {
        today: 1,
        week: 7,
        month: 30,
        sixMonths: 180,
      };

      const daysAgo = periods[selectedPeriod.value];
      const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
      const cutoffDateStr =
        cutoffDate.getFullYear() +
        String(cutoffDate.getMonth() + 1).padStart(2, "0") +
        String(cutoffDate.getDate()).padStart(2, "0");

      results = results.filter(
        (item) => item.createdAt && item.createdAt >= cutoffDateStr
      );
    }

    // null check를 포함한 정렬
    return results.sort((a, b) => {
      // createdAt이 없는 항목은 마지막으로 정렬
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;

      const result =
        sortOrder.value === "latest"
          ? b.createdAt.localeCompare(a.createdAt)
          : a.createdAt.localeCompare(b.createdAt);

      console.log("Comparing:", {
        a: a.createdAt,
        b: b.createdAt,
        result: result,
      });

      return result;
    });
  });

  // 결과 개수 계산
  const resultCounts = computed(() => ({
    all: searchResults.value.length,
    ...Object.fromEntries(
      Object.keys(domainResults.value).map((domain) => [
        domain,
        domainResults.value[domain].length,
      ])
    ),
  }));

  const limitedResults = (domain) => {
    // 도메인별 결과를 가져온 후 정렬 적용
    let results = domainResults.value[domain] || [];

    // 정렬 로직 적용
    results = results.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;

      return sortOrder.value === "latest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt);
    });

    // 정렬된 결과의 상위 5개 반환
    return results.slice(0, 5);
  };

  const getDomainTitle = (domain) => {
    const filterObj = filters.find((f) => f.id === domain);
    return filterObj ? filterObj.name : domain;
  };

  // showMore 함수 추가
  const showMore = (domain) => {
    currentFilter.value = domain;
    // 스크롤을 맨 위로 부드럽게 이동
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 통합 초기화 함수 추가
  const resetAllFilters = () => {
    sortOrder.value = "latest";
    selectedPeriod.value = "all";
  };

  return {
    searchResults,
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
  };
}
