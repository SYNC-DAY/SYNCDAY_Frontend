<!-- App.vue 또는 다른 부모 컴포넌트 -->
<template>
    <SideBar>
      <ProjItem title="MUDIUM" :isActive="true">
        <WorkSpaceItem 
          title="Frontend"
          :isActive="activeWorkspace === 'Frontend'"
          @select="selectWorkspace('Frontend')"
        />
        <WorkSpaceItem 
          title="Backend"
          :isActive="activeWorkspace === 'Backend'"
          @select="selectWorkspace('Backend')"
        />
      </ProjItem>
      
      <ProjItem title="Mudium_Backend">
        <WorkSpaceItem 
          title="워크스페이스"
          :isActive="activeWorkspace === 'Mudium_Backend_WS'"
          @select="selectWorkspace('Mudium_Backend_WS')"
        />
      </ProjItem>

      <ProjItem title="Mudium_Frontend">
        <WorkSpaceItem 
          title="워크스페이스"
          :isActive="activeWorkspace === 'Mudium_Frontend_WS'"
          @select="selectWorkspace('Mudium_Frontend_WS')"
        />
      </ProjItem>

      <ProjItem title="Mudium_DB">
        <WorkSpaceItem 
          title="워크스페이스"
          :isActive="activeWorkspace === 'Mudium_DB_WS'"
          @select="selectWorkspace('Mudium_DB_WS')"
        />
      </ProjItem>
    </SideBar>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from '@/components/layout/SideBar.vue';
import ProjItem from './components/ProjItem.vue'
import WorkSpaceItem from './components/WorkspaceItem.vue'
const activeWorkspace = ref(null)

const selectWorkspace = (workspace) => {
  activeWorkspace.value = workspace
}
</script>