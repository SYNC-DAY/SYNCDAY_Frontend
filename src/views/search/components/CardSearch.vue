<template>
    <div class="result-content" @click="$emit('click')">
        <div class="result-header">
            <i class="pi pi-th-large"></i>
            <h3>{{ result.cardTitle }}</h3>
        </div>
        <p class="result-date">생성일: {{ result.createdAt }}</p>
        <div class="result-meta-grid">
            <div v-if="result.cardContent" class="meta-item">
                <span class="meta-label">내용:</span>
                <span class="meta-value">{{ result.cardContent }}</span>
            </div>
            <div v-if="result.creatorName" class="meta-item">
                <span class="meta-label">생성자:</span>
                <span class="meta-value">{{ result.creatorName }}</span>
            </div>
            <div v-if="result.assigneeName" class="meta-item">
                <span class="meta-label">담당자:</span>
                <span class="meta-value">{{ result.assigneeName }}</span>
            </div>
            <div v-if="result.cardboardName" class="meta-item">
                <span class="meta-label">카드보드 이름:</span>
                <span class="meta-value">{{ result.cardboardName }}</span>
            </div>
            <div v-if="result.workspaceName" class="meta-item">
                <span class="meta-label">워크스페이스명:</span>
                <span class="meta-value">{{ result.workspaceName }}</span>
            </div>
            <div v-if="result.vcsObject" class="meta-item">
                <span class="meta-label">VCS 객체 종류:</span>
                <span class="meta-value">{{ result.vcsObject }}</span>
            </div>
            <div v-if="result.vcsUrl" class="meta-item">
                <span class="meta-label">VCS URL:</span>
                <span class="meta-value">{{ result.vcsUrl }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
    result: {
        type: Object,
        required: true
    }
});
</script>


<style scoped>
.result-content {
    cursor: pointer;
    padding: 1rem;
    border-radius: 8px;
    transition: background-color 0.2s;
    width: 100%;
    /* 전체 너비 사용 */
}

.result-meta {
    display: flex;
    flex-wrap: wrap;
    /* 긴 내용을 여러 줄로 표시 */
    gap: 1rem;
    color: #666;
    font-size: 0.9rem;
    max-width: 100%;
    /* 컨테이너 너비를 넘지 않도록 */
}

.result-content:hover {
    background-color: #f5f5f5;
}

/* URL이 긴 경우를 위한 스타일 추가 */
.result-meta span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.result-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.result-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.result-header h3 {
    margin: 0;
    /* color: #FE5D86; */
    color: #15B8A6;
    font-size: large;
    margin-bottom: 0.3rem;
}


.meta-item {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
}

.meta-label {
    color: #666;
    white-space: nowrap;
}

.meta-value {
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>