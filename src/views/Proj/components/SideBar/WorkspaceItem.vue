// WorkspaceItem.vue
<template>
  <div 
    class="workspace-item" 
    :class="{ 'active': isActive }"
    @click="navigateToWorkspace"
  >
    <div class="workspace-header">
      <div class="workspace-info">
        <div class="title">{{ title }}</div>
        <div class="progress-info">
          <div class="progress-bar" :title="`Progress: ${progress}%`">
            <div 
              class="progress-fill"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <span class="progress-text">{{ progress }}%</span>
        </div>
      </div>
      <button 
        class="bookmark-btn"
        @click.stop.prevent="toggleBookmark"
      >
        <span :class="['star-icon', { 'bookmarked': isBookmarked }]">★</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  initialBookmarked: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  workspaceId: {
    type: Number,
    required: true
  },
  projectId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['select', 'bookmark-changed']);

const isBookmarked = ref(props.initialBookmarked);

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value;
  emit('bookmark-changed', isBookmarked.value);
};

const navigateToWorkspace = () => {
  emit('select', props.workspaceId, props.projectId);
};
</script>

<style scoped>
.workspace-item {
  position: relative;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.workspace-header:hover {
  background-color: var(--hover-color, #f5f5f5);
}

.workspace-item.active .workspace-header {
  background-color: var(--background-active);
}

.workspace-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(to bottom, #ff7eb3, #ff9f7d);
}

.workspace-info {
  flex-grow: 1;
  margin-right: 0.75rem;
}

.title {
  font-weight: 400;
  margin-bottom: 0.5rem;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  width: 100px;
  height: 4px;
  background-color: var(--outline-gray);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #ff7eb3, #ff9f7d);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.bookmark-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--background-inactive);
  transition: color 0.2s;
}

.star-icon {
  font-size: 1rem;
}

.star-icon.bookmarked {
  color: var(--apricot-color);
}
</style>
