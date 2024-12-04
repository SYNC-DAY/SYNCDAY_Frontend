<template>
    <div class="result-content" @click="$emit('click')">
        <div class="result-header">
            <div class="title-section">
                <i class="pi pi-th-large"></i>
                <h3>{{ result.cardTitle }}</h3>
            </div>
            <a 
                v-if="result.vcsUrl" 
                :href="result.vcsUrl" 
                target="_blank" 
                class="vcs-link"
                @click.stop
            >
                <div class="vcs-info">
                    {{ result.vcsObject }}
                    <i class="pi pi-external-link" style="font-size: 16px;"></i>
                </div>
            </a>
        </div>
        <p class="result-date">생성일: {{ result.createdAt }}</p>
        <div class="result-meta-wrapper">
            <div class="result-meta-left">
                <div v-if="result.cardContent" class="meta-item">
                    <span class="meta-label">내용:</span>
                    <span class="meta-value">{{ result.cardContent }}</span>
                </div>
                <div v-if="result.workspaceName" class="meta-item">
                    <span class="meta-label">워크스페이스명:</span>
                    <span class="meta-value">{{ result.workspaceName }}</span>
                </div>
                <div v-if="result.cardboardName" class="meta-item">
                    <span class="meta-label">카드보드 이름:</span>
                    <span class="meta-value">{{ result.cardboardName }}</span>
                </div>
            </div>
            <div class="result-meta-right">
                <div v-if="result.creatorName" class="meta-item">
                    <span class="meta-label">생성자:</span>
                    <span class="meta-value">{{ result.creatorName }}</span>
                </div>
                <div v-if="result.assigneeName" class="meta-item">
                    <span class="meta-label">담당자:</span>
                    <span class="meta-value">{{ result.assigneeName }}</span>
                </div>
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
    border-radius: 0.5rem;
    transition: background-color 0.2s;
    width: 100%;
}

.result-content:hover {
    background-color: #f5f5f5;
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.title-section {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.title-section h3 {
    margin: 0;
    color: #FE5D86;
    font-size: 1.125rem;
}

.vcs-link {
    text-decoration: none;
    color: inherit;
}

.vcs-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: #ffffff;
    border-radius: 0.25rem;
    color: #666;
    font-size: 1rem;
    transition: background-color 0.2s;
}

.vcs-info:hover {
    color: #ffffff;
    background-color: #000;
}

.result-meta-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 0.5rem;
    width: 100%;
    overflow: hidden; /* 내용이 넘치지 않도록 */
}

.result-meta-left, .result-meta-right {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%; /* 컨테이너 전체 너비 사용 */
    overflow: hidden; /* 내용이 넘치지 않도록 */
}

.meta-item {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
    min-height: 1.5rem; /* 24px -> 1.5rem */
    max-width: 100%; /* 부모 너비를 넘지 않도록 제한 */
}

.meta-label {
    color: #666;
    white-space: nowrap;
    min-width: 1rem;
    flex-shrink: 0; /* 레이블은 크기가 줄어들지 않도록 */
}

.meta-value {
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 2rem); /* label과 gap을 고려한 너비 */
    flex: 1;
}

.result-date {
    color: #666;
    font-size: 0.875rem;
    margin: 0.375rem 0;
}
</style>