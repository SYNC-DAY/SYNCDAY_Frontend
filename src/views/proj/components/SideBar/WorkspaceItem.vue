<template>
  <div class="workspace-item container-row" :class="{ 'active': isActive }" @click="navigateToWorkspace">
    <div class="workspace-left">
      <span>{{ title }}</span>
    </div>
    <div class=workspace-right>
      <i class="pi" :class="{ 'pi-star': !initialBookmarked, 'pi-star-fill': initialBookmarked }"></i>
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
  projectId: {  // Changed from projId to projectId
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
  margin-left: 3rem;
  height: 3rem;
  position: relative;
  border-bottom: 1px solid var(--outline-gray);
  cursor: pointer;

}

.workspace-item.active {
  font-weight: 600;
}

.workspace-right {
  position: absolute;
  display: flex;
  right: 1rem;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.workspace-right i {
  color: var(--apricot-color);
}
</style>