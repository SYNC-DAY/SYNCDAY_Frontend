<template>
    <div>
        <div v-for="(card, index) in todayCardList" :key="index" 
            class="card-container"
            @click="openCardDetailModal(card)">
            <div class="tag-container" :style="{ backgroundColor: card.color}">
                {{ card.tag_name }}
            </div>
            <div class="card-title">
                {{ card.title }}
            </div>
            <div class="card-date">
                {{ formatDate(card.start_time) }} ~ {{ formatDate(card.end_time) }}
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const todayCardList = ref([]);

// 날짜 포매터
const formatDate = (dateString) => {
    const date = new Date(dateString);

    const year = String(date.getFullYear()).slice(2); // '24'
    const month = String(date.getMonth() + 1).padStart(2, "0"); // '12'
    const day = String(date.getDate()).padStart(2, "0"); // '04'

    return `${year}.${month}.${day}`;
};

// 오늘 카드 리스트 가져오기
const getTodayCardList = async () => {
    try {
        const response = await axios.get(`/cards/today/${authStore.user.userId}`);
        todayCardList.value = response.data.data;
        console.log(todayCardList);
    } catch (error) {
        console.error("Failed to fetch cards:", error);
    }
};

const openCardDetailModal = (card) => {
    window.alert(card.content);
};

onMounted(async () => {
    await getTodayCardList();
});
</script>

<style scoped>
/* 카드 컨테이너 스타일 */
.card-container {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
}

/* 호버 효과 */
.card-container:hover {
    border-color: #007bff;
}

/* 태그 스타일 */
.tag-container {
    background-color: #e0e0e0;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
    display: inline-block;
}

/* 카드 제목 스타일 */
.card-title {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #333;
}

/* 카드 날짜 스타일 */
.card-date {
    font-size: 1rem;
    color: #666;
}

</style>
