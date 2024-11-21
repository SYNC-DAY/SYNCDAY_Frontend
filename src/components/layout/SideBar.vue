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
  width: 12rem;
  height: calc(100vh - 10vh); /* nav바 높이를 빼줍니다 */
  transition: width 0.3s ease-in-out;
  position: relative;
  z-index: 10;
  border-right: 1px solid var(--background-gray)
}

aside.collapsed {
  width: 0.00vw;
  padding: 0rem;
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
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  transition: all 0.3s ease;
}

.sidebar-item:hover {
  background-color: var(--background-gray);
}

.sidebar-item.active {
  position: relative;
  color: inherit;
 
}

.sidebar-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 1.5rem; 
  height: 100%;
  background: linear-gradient(to bottom, var(--pink-color), var(--apricot-color));
  z-index: 1; 
}

.sidebar.collapsed .menu-items {
  display: none; 
}

.menu-items .sidebar-item {
  font-size: 2rem;
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
  /* background-color: #ccc;  */
}
</style>