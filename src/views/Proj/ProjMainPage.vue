<template>
  <SideBar>
    <template v-for="proj in projs" :key="proj.proj_id">
      <ProjItem 
        :title="getProjTitle(proj.proj_id)"
        :isActive="activeProject === proj.proj_id"
        :initialBookmarked="proj.bookmark_status === 'BOOKMARKED'"
        @click="selectProject(proj.proj_id)"
        @bookmark-changed="handleBookmarkChange(proj.proj_id, $event)"
      >
        <!-- 프로젝트별 워크스페이스 설정 -->
        <template v-if="proj.proj_id === 1"> <!-- MUDIUM -->
          <WorkspaceItem 
            title="Frontend"
            :isActive="activeWorkspace === 'Frontend'"
            :initialBookmarked="false"
            @select="selectWorkspace('Frontend')"
            @bookmark-changed="handleWorkspaceBookmark('Frontend', $event)"
          />
          <WorkspaceItem 
            title="Backend"
            :isActive="activeWorkspace === 'Backend'"
            :initialBookmarked="false"
            @select="selectWorkspace('Backend')"
            @bookmark-changed="handleWorkspaceBookmark('Backend', $event)"
          />
        </template>
        <template v-else>
          <WorkspaceItem 
            title="워크스페이스"
            :isActive="activeWorkspace === `WS_${proj.proj_id}`"
            :initialBookmarked="false"
            @select="selectWorkspace(`WS_${proj.proj_id}`)"
            @bookmark-changed="handleWorkspaceBookmark(`WS_${proj.proj_id}`, $event)"
          />
        </template>
      </ProjItem>
    </template>
  </SideBar>
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

const projs = ref([])
const activeWorkspace = ref(null)
const activeProject = ref(null)

// 프로젝트 ID에 따른 제목 매핑
const projectTitles = {
1: 'MUDIUM',
4: 'Mudium_Backend',
5: 'Mudium_Frontend',
8: 'Mudium_DB'
// 필요한 경우 더 추가
}

const getProjTitle = (projId) => {
return projectTitles[projId] || `Project ${projId}`
}

const selectWorkspace = (workspace) => {
activeWorkspace.value = workspace
}

const selectProject = (projId) => {
activeProject.value = projId
}

const handleBookmarkChange = async (projId, isBookmarked) => {
try {
  await axios.put(`/proj-members/${projId}/bookmark`, {
    bookmark_status: isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
  })
  // 성공적으로 업데이트된 경우 로컬 상태 업데이트
  const proj = projs.value.find(p => p.proj_id === projId)
  if (proj) {
    proj.bookmark_status = isBookmarked ? 'BOOKMARKED' : 'UNBOOKMARKED'
  }
} catch (err) {
  console.error('Failed to update bookmark status:', err)
}
}

const handleWorkspaceBookmark = async (workspaceId, isBookmarked) => {
// 워크스페이스 북마크 처리 로직 구현
console.log(`Workspace ${workspaceId} bookmark changed to ${isBookmarked}`)
}

const fetchProjs = async(userId) => {
try {
  const response = await axios.get(`/projs/users/${userId}`)
  if (response.data.success) {
    projs.value = response.data.data
  } else {
    throw new Error(response.data.error || 'Failed to fetch Projs')
  }
} catch (err) {
  console.error('Failed to fetch projects:', err)
}
}

onMounted(() => {
fetchProjs(user.value.userId)
})
</script>