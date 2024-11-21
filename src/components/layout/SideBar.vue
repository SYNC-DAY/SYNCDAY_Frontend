// SideBar.vue
<template>
  <aside :class="['sidebar', { collapsed: isCollapsed }]">
    <button @click="toggleSidebar" class="toggle-button">
      {{ isCollapsed ? '>' : '<' }}
    </button>
    <div v-if="!isCollapsed" class="sidebar-content">
      <slot></slot>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';

const isCollapsed = ref(false);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.sidebar {
  width: 12rem;
  height: calc(100vh - 10vh);
  transition: width 0.3s ease-in-out;
  position: relative;
  z-index: 10;
  border-right: 1px solid var(--background-gray);
  background-color: white;
}

.sidebar.collapsed {
  width: 0;
  padding: 0;
}

.toggle-button {
  position: absolute;
  top: 1rem;
  right: -1.5rem;
  background-color: white;
  border-radius: 0 0.5rem 0.5rem 0;
  border: 1px solid var(--background-gray);
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  z-index: 1;
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 1rem 0;
}

.sidebar.collapsed .sidebar-content {
  display: none;
}
</style>
