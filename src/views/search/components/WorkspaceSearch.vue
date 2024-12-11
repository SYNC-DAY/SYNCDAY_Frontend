<template>
  <div class="result-content" @click="$emit('click')">
    <div class="result-header">
      <div class="title-section">
        <i class="pi pi-share-alt"></i>
        <h3>{{ result.workspaceName }}</h3>
      </div>
      <!-- VCS 정보를 별도 링크로 분리 -->
      <a 
        v-if="result.vcsRepoUrl" 
        :href="result.vcsRepoUrl" 
        target="_blank" 
        class="vcs-link"
        @click.stop
      >
        <div class="vcs-info">
          {{ result.vcsRepoName }}
          <i v-if="result.vcsType?.toLowerCase() === 'github'" class="pi pi-github"
          style="font-size: 16px; width: 16px; height: 16px;"></i>
          <img
            v-else-if="result.vcsType?.toLowerCase() === 'gitlab'"
            :src="GitlabIcon"
            alt="Gitlab"
            class="gitlab-icon"
            style="font-size: 16px; width: 16px; height: 16px;"
          >
        </div>
      </a>
    </div>
    <p class="result-date">생성일: {{ result.createdAt }}</p>
    <p class="project-name">프로젝트명: {{ result.projectName }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import GitlabIcon from '@/assets/icons/Gitlab.svg';

defineProps({
  result: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.result-content {
  width: 100%;
  cursor: pointer;
  padding: 1rem;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.result-content:hover {
  background-color: #f5f5f5;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-section i {
  font-size: 1.2rem;
  color: #666;
}

.title-section h3 {
  margin: 0;
  /* color: #FE5D86; */
  color: #15B8A6;
  font-size: large;
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
  border-radius: 4px;
  color: #666;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.vcs-info:hover {
  color: #ffffff;
  background-color: #000;
}

.gitlab-icon {
  width: 16px;
  height: 16px;
}

.gitlab-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0); /* 기본 상태에서 검은색 */
}

.vcs-info:hover .gitlab-icon {
  filter: invert(100%) brightness(100%) contrast(100%); /* hover 시 흰색으로 */
}

.result-date, .project-name {
  color: #666;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}
</style>