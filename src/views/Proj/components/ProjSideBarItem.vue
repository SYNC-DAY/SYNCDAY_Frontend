
// ProjSideBarItem.vue
<template>
  <div class="proj-sidebar-group">
    <div 
      class="proj-header" 
      @click="toggleExpand"
      :class="{ 'active': isActive }"
    >
      <div class="proj-title">
        {{ title }}
        <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
      </div>
      <div class="proj-actions">
        <button 
          class="bookmark-btn"
          @click.stop="toggleBookmark"
        >
          <span class="star-icon" :class="{ 'bookmarked': isBookmarked }">
            ★
          </span>
        </button>
      </div>
    </div>
    
    <div v-if="isExpanded" class="proj-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
  }
});

const isExpanded = ref(false);
const isBookmarked = ref(props.initialBookmarked);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value;
};
</script>

<style scoped>
.proj-sidebar-group {
  margin-bottom: 0.5rem;
}

.proj-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  position: relative;
  font-size: 1.2rem;
  transition: background-color 0.2s ease;
}

.proj-header.active {
  position: relative;
}

.proj-header.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0.25rem;
  background: linear-gradient(to bottom, var(--pink-color), var(--apricot-color));
}

.proj-title {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expand-icon {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.proj-actions {
  display: flex;
  align-items: center;
}

.bookmark-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 1.2rem;
  color: var(--background-gray);
  transition: color 0.2s ease;
}

.star-icon {
  transition: color 0.2s ease;
}

.star-icon.bookmarked {
  color: var(--apricot-color);
}

.proj-content {
  padding: 0.5rem 1rem 0.5rem 2rem;
}

.proj-header:hover {
  background-color: var(--background-gray);
}
</style>