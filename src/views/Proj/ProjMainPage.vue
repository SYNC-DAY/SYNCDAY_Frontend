<!-- App.vue 또는 다른 부모 컴포넌트 -->
<template>
    <SideBar>
      <ProjItem title="MUDIUM" :isActive="activeProject === 'MUDIUM'" @click="selectProject('MUDIUM')">
        <WorkspaceItem 
          title="Frontend"
          :isActive="activeWorkspace === 'Frontend'"
          @select="selectWorkspace('Frontend')"
        />
        <WorkspaceItem 
          title="Backend"
          :isActive="activeWorkspace === 'Backend'"
          @select="selectWorkspace('Backend')"
        />
      </ProjItem>
      
      <ProjItem title="Mudium_Backend" :isActive="activeProject==='Mudium_Backend'" @click="selectProject('Mudium_Backend')">
        <WorkspaceItem 
          title="워크스페이스"
          :isActive="activeWorkspace === 'Mudium_Backend_WS'"
          @select="selectWorkspace('Mudium_Backend_WS')"
        />
      </ProjItem>

      <ProjItem title="Mudium_Frontend">
        <WorkspaceItem 
          title="워크스페이스"
          :isActive="activeWorkspace === 'Mudium_Frontend_WS'"
          @select="selectWorkspace('Mudium_Frontend_WS')"
        />
      </ProjItem>

      <ProjItem title="Mudium_DB">
        <WorkspaceItem 
          title="워크스페이스"
          :isActive="activeWorkspace === 'Mudium_DB_WS'"
          @select="selectWorkspace('Mudium_DB_WS')"
        />
      </ProjItem>
    </SideBar>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios';

import SideBar from '@/components/layout/SideBar.vue';
import ProjItem from './components/ProjItem.vue';
import WorkspaceItem from './components/WorkSpaceItem.vue';

import {useAuthStore} from "@/stores/auth.js";
import {storeToRefs} from "pinia";

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)


const projs = ref([]);

const activeWorkspace = ref(null)
const activeProject = ref(null)
const selectWorkspace = (workspace) => {
  activeWorkspace.value = workspace
}


const selectProject = (project) => {
  activeProject.value = project
}


/* onMounted */
const fetchProjs = async(userId) => {

  console.log("fetching projs")
  try{
    const response = await axios.get(`/proj-members/users/${userId}`);

    if(response.data.success){
      projs.value = response.data;
    } else{
      throw new Error(response.data.error || 'Failed to fetch Projs');
    }
  } catch(err) {
    console.log(err);
  }
}

onMounted(()=>{
  fetchProjs(user.value.userId);
})
</script>