<template>
  <div class="result-content" @click="$emit('click')">
    <div class="result-header">
      <i class="pi pi-folder" style="font-size: 16px; height: 20px;"></i>
      <h3>{{ result.projectName }}</h3>
    </div>
    <p class="result-date">생성일: {{ result.createdAt }}</p>
    <div class="result-meta">
      <span v-if="result.vcsType">
        VCS: 
        <span style="display: inline-flex; align-items: center;">
          {{ result.vcsType }}
          <i v-if="result.vcsType.toLowerCase() === 'github'" 
            class="pi pi-github" 
            style="margin-left: 4px; font-size: 16px; width: 16px; height: 16px;"></i>
          <img v-if="result.vcsType.toLowerCase() === 'gitlab'" 
              :src="GitlabIcon" 
              alt="Gitlab" 
              style="width: 16px; height: 16px; margin-left: 4px;">
        </span>
      </span>
    </div>
  </div>
</template>
<script setup>
import {defineProps, onMounted} from 'vue';
import GitlabIcon from '@/assets/icons/Gitlab.svg';

const props = defineProps({
  result: {
    type: Object,
    required: true
  }
});

onMounted(() => {
  console.log('컴포넌트 마운트 시 props 데이터:', props.result);
});
</script>

<style scoped>
.result-content {
  cursor: pointer;
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.2s;
  width: 100%; /* 전체 너비 사용 */
}

.result-content:hover {
  background-color: #f5f5f5;
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

.result-date {
  font-size: 1rem;
  margin: 0.5rem 0;
}

.result-meta {
  display: flex;
  gap: 1rem;
  color: #646464;
  font-size: 0.9rem;
}
</style>