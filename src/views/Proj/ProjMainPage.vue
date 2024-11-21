<!-- ProjMainPage.vue -->
<template>
  <SideBar>
    <template v-for="proj in projects" :key="proj.proj_id">
      <ProjItem 
        :title="proj.proj_name"
        :isActive="activeProject === proj.proj_id"
        :initialBookmarked="proj.bookmark_status === 'BOOKMARKED'"
        :progress="proj.progress_status"
        @toggle="toggleProject(proj.proj_id)"
        @bookmark-changed="handleBookmarkChange(proj.proj_id, $event)"
      >
        <template v-for="workspace in proj.workspaces" :key="workspace.workspace_id">
          <WorkspaceItem 
            :title="workspace.workspace_name"
            :isActive="activeWorkspace === workspace.workspace_id"
            :progress="workspace.progress_status"
            :initialBookmarked="workspace.bookmark_status === 'BOOKMARKED'"
            @select="selectWorkspace(workspace.workspace_id, proj.proj_id)"
            @bookmark-changed="handleWorkspaceBookmark(workspace.workspace_id, $event)"
          />
        </template>
      </ProjItem>
    </template>
  </SideBar>

  <div class="proj-main">
    
    <!-- 프로젝트 정보 표시 -->
  </div>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import SideBar from '@/components/layout/SideBar.vue'
import ProjItem from './components/ProjItem.vue'
import WorkspaceItem from './components/WorkSpaceItem.vue'
import { useAuthStore } from "@/stores/auth.js"
import { storeToRefs } from "pinia"

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const projects = ref([])
const activeWorkspace = ref(null)
const activeProject = ref(null)

const selectWorkspace = (workspaceId, projId) => {
  activeWorkspace.value = workspaceId
  activeProject.value = projId
}

const toggleProject = (projId) => {
  activeProject.value = projId
}

const handleBookmarkChange = async (projId, isBookmarked) => {
  try {
    await axios.put(`/proj-members/${projId}/bookmark`, {
      bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
    })
    const proj = projects.value.find(p => p.proj_id === projId)
    if (proj) {
      proj.bookmark_status = isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
    }
  } catch (err) {
    console.error('Failed to update bookmark status:', err)
  }
}

const handleWorkspaceBookmark = async (workspaceId, isBookmarked) => {
  try {
    await axios.put(`/workspaces/${workspaceId}/bookmark`, {
      bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
    })
    // Update local state
    projects.value.forEach(proj => {
      const workspace = proj.workspaces.find(ws => ws.workspace_id === workspaceId)
      if (workspace) {
        workspace.bookmark_status = isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
      }
    })
  } catch (err) {
    console.error('Failed to update workspace bookmark:', err)
  }
}

const fetchProjs = async(userId) => {
  try {
    const response = await axios.get(`/projs/users/${userId}`)
    if (response.data.success) {
      projects.value = response.data.data
    } else {
      throw new Error(response.data.error || 'Failed to fetch Projects')
    }
  } catch (err) {
    console.error('Failed to fetch projects:', err)
  }
}

onMounted(() => {
  fetchProjs(user.value.userId)
})
</script>
