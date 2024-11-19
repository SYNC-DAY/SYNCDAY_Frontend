<template>  
<aside :class="['sidebar', { collapsed: isCollapsed }]" :style="{ height: sidebarHeight }">
    <button @click="toggleSidebar" class="toggle-button">
      {{ isCollapsed ? '>' : '<' }}
    </button>
    <div v-if="!isCollapsed" class="menu-items">
      <div 
        v-for="(item, index) in menuItems" 
        :key="index" 
        :class="['sidebar-item', { active: activeIndex === index }]"
        @click="setActive(index)"
      >
        {{ item }}
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  menuItems: {
    type: Array,
    required: true
  }
});

const isCollapsed = ref(false);
const activeIndex = ref(null);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};

const setActive = (index) => {
  activeIndex.value = index;
};

const sidebarHeight = computed(() => {
  const itemHeight = 64; 
  const padding = 20;
  return `${props.menuItems.length * itemHeight + padding}px`;
});
</script>

<style scoped>
aside {
  width: 15rem;
  height: calc(100vh - 8rem); /* nav바 높이를 빼줍니다 */
  background: #fff;
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  transition: width 0.3s ease-in-out;
  position: relative;
  z-index: 10;
}

aside.collapsed {
  width: 0.00vw;
  padding: 0.5rem;
}

.toggle-button {
  position: absolute;
  top: 10px;
  right: -20px;
  background-color: white;
  border-radius: 0 5px 5px 0;
  border: 1px solid #ccc;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.sidebar-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.sidebar-item:hover {
  background-color: #f0f0f0;
}

.sidebar-item.active {
  position: relative;
  color: inherit;
  background-color: white; 
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 10px; 
  height: 100%;
  background: linear-gradient(to bottom, #ff7e5f, #feb47b);
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  z-index: 1; 
}

.sidebar.collapsed .menu-items {
  display: none; 
}

.menu-items .sidebar-item {
  font-size: large;
  position: relative;
  margin-bottom: 0.5rem; 
}

.menu-items .sidebar-item::after {
  content: '';
  position: absolute;
  top: -0.25rem; 
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #ccc; 
}
</style>