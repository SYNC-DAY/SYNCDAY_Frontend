<!-- ProjMainPage.vue -->
<template>

    <SideBar>
      <template v-for="proj in projects" :key="proj.proj_id">
        <ProjItem 
          :title="proj.proj_name"
          :isActive="activeProject === proj.proj_id"
          :initialBookmarked="proj.bookmark_status === 'BOOKMARKED'"
          :progress="proj.progress_status"
          :isExpanded="expandedProjects.includes(proj.proj_id)"
          @toggle-expansion="toggleProjectExpansion(proj.proj_id)"
          @select="selectProject(proj.proj_id)"
          @bookmark-changed="handleBookmarkChange(proj.proj_id, $event)"
        >
          <template v-for="workspace in proj.workspaces" :key="workspace.workspace_id">
            <WorkspaceItem 
              :workspaceId="workspace.workspace_id"
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
      <div v-if="selectedProject" class="max-w-4xl">
        <div class="mb-6">
          <h1 class="text-2xl font-semibold mb-2">{{ selectedProject.proj_name }}</h1>
          <div class="text-sm text-gray-600">생성일: {{ formatDate(selectedProject.created_at) }}</div>
        </div>

        <div class="grid gap-4 mb-8">
          <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="font-medium">프로젝트 진행 현황</h2>
              <div class="text-sm">
                {{ formatDate(selectedProject.start_time) }} - {{ formatDate(selectedProject.end_time) }}
              </div>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm text-gray-600">진행률:</span>
              <span>{{ selectedProject.progress_status }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full">
              <div 
                class="h-full rounded-full bg-gradient-to-r from-[#ff7eb3] to-[#ff9f7d]"
                :style="{ width: `${selectedProject.progress_status}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="workspace-section">
          <h2 class="text-lg font-medium mb-4">워크스페이스</h2>
          <div class="grid gap-4">
            <template v-for="workspace in selectedProject.workspaces" :key="workspace.workspace_id">
              <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="font-medium">{{ workspace.workspace_name }}</h3>
                  <div class="text-sm text-gray-600">
                    생성일: {{ formatDate(workspace.created_at) }}
                  </div>
                </div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-600">진행률:</span>
                  <span>{{ workspace.progress_status }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    class="h-full rounded-full bg-gradient-to-r from-[#ff7eb3] to-[#ff9f7d]"
                    :style="{ width: `${workspace.progress_status}%` }"
                  ></div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        프로젝트를 선택해주세요
      </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from "@/stores/auth.js"
import { storeToRefs } from "pinia"
import axios from 'axios'
import {useRouter} from 'vue-router'
const router = useRouter()


import SideBar from '@/components/layout/SideBar.vue'
import ProjItem from './components/SideBar/ProjItem.vue'
import WorkspaceItem from './components/SideBar/WorkspaceItem.vue'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const projects = ref([])
const activeWorkspace = ref(null)
const activeProject = ref(null)
const expandedProjects=ref([])

const selectedProject = computed(() => 
  projects.value.find(proj => proj.proj_id === activeProject.value)
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const selectWorkspace = (workspaceId, projId) => {
  activeWorkspace.value = workspaceId
  activeProject.value = projId
}
const selectProject = (projId) => {
  activeProject.value = projId
}
const toggleProjectExpansion = (projId) => {
  const index = expandedProjects.value.indexOf(projId)
  if (index === -1) {
    expandedProjects.value.push(projId)
  } else {
    expandedProjects.value.splice(index, 1)
  }}

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

<style scoped>
.proj-main {
  height: calc(100%-10vh);
  flex: 1;
  padding-left: 1rem;
  display: inline-block;
  overflow-y: auto;
  background-color: #f9fafb;
}
</style>