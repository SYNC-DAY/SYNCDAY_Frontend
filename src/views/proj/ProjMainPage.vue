<template>
  <SideBar>
    <!-- Loading state -->
    <div v-if="projStore.isLoading" class="p-4">
      <ProgressSpinner />
    </div>

    <!-- Error state -->
    <div v-else-if="projStore.error" class="p-4 text-red-600">
      {{ projStore.error }}
      <Button label="Retry" icon="pi pi-refresh" @click="retryLoad" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!projStore.hasProjects" class="p-4">
      <p class="text-gray-500 mb-4">No projects available</p>
      <Button label="New Project" icon="pi pi-plus" @click="showNewProjModal = true" />
    </div>

    <!-- Projects list -->
    <template v-else>
      <template v-for="(proj, id) in projStore.projects" :key="id">
        <ProjItem :proj="proj" :isActive="activeProject == id" :isExpanded="expandedProjects.includes(id)"
          :projId="parseInt(id)" :userId="authStore.user.userId" @toggle-expansion="toggleProjectExpansion(id)"
          @select="selectProject(id)">
          <template v-for="workspace in proj.workspaces" :key="workspace.workspace_id">
            <WorkspaceItem :workspaceId="workspace.workspace_id" :projectId="id" :title="workspace.workspace_name"
              :isActive="activeWorkspace === workspace.workspace_id" :progress="workspace.progress_status"
              :initialBookmarked="workspace.bookmark_status === 'BOOKMARKED'"
              @select="selectWorkspace(id, workspace.workspace_id)" @bookmark-changed="handleWorkspaceBookmark" />
          </template>
        </ProjItem>
      </template>

      <div class="container-row justify-center p-4">
        <Button label="New Project" icon="pi pi-plus" @click="showNewProjModal = true" />
      </div>
    </template>
  </SideBar>

  <NewProjModal v-model:visible="showNewProjModal" @submit="handleProjectSubmit" />

  <div class="proj-main">
    <router-view />
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import { useToast } from 'primevue/usetoast';
  import { useProjectStore } from '@/stores/proj/useProjectStore';
  import { useAuthStore } from '@/stores/auth.js';
  import ProgressSpinner from 'primevue/progressspinner';

  import SideBar from '@/components/SideBar.vue';

  const router = useRouter();
  const toast = useToast();
  const projStore = useProjectStore();
  const authStore = useAuthStore();

  const activeWorkspace = ref(null);
  const activeProject = ref(null);
  const expandedProjects = ref([]);
  const showNewProjModal = ref(false);

  const retryLoad = async () => {
    try {
      await projStore.initializeStore(authStore.user.userId);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: '로드 실패',
        detail: '프로젝트를 불러오는데 실패했습니다.',
        life: 3000
      });
    }
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      const response = await axios.post("/projs/", {
        user_id: authStore.user.userId,
        proj_name: projectData.name,
        start_time: projectData.startDate ? new Date(projectData.startDate).toISOString() : null,
        end_time: projectData.endDate ? new Date(projectData.endDate).toISOString() : null
      });

      if (response.data.success) {
        const newProject = {
          proj_id: response.data.data.proj_id,
          proj_name: projectData.name,
          start_time: projectData.startDate,
          end_time: projectData.endDate,
          progress_status: 0,
          bookmark_status: 'NONE',
          participation_status: 'OWNER',
          created_at: new Date().toISOString(),
          workspaces: []
        };

        projStore.addProject(newProject);
        showNewProjModal.value = false;

        toast.add({
          severity: 'success',
          summary: '프로젝트 생성 성공',
          detail: '새 프로젝트가 생성되었습니다.',
          life: 3000
        });

        selectProject(newProject.proj_id);
      }
    } catch (error) {
      console.error('Project creation failed:', error);
      toast.add({
        severity: 'error',
        summary: '프로젝트 생성 실패',
        detail: error.message || '프로젝트 생성 중 오류가 발생했습니다.',
        life: 3000
      });
    }
  };

  // Other methods remain the same...
  const selectProject = async (projId) => {
    try {
      activeProject.value = projId;
      activeWorkspace.value = null;
      console.log(projId)
      await router.push({
        name: 'Project',
        params: { projectId: projId }
      });
    } catch (err) {
      console.error('Project navigation failed:', err);
      toast.add({
        severity: 'error',
        summary: '이동 실패',
        detail: '프로젝트로 이동하는 중 오류가 발생했습니다.',
        life: 3000
      });
    }
  };
  const selectWorkspace = async (projId, workspaceId) => {
    try {
      activeProject.value = projId;
      activeWorkspace.value = workspaceId;

      await router.push({
        name: 'Workspace',
        params: {
          projectId: projId,
          workspaceId: workspaceId
        }
      });
    } catch (err) {
      console.error('Workspace navigation failed:', err);
      toast.add({
        severity: 'error',
        summary: '이동 실패',
        detail: '워크스페이스로 이동하는 중 오류가 발생했습니다.',
        life: 3000
      });
    }
  };
  const toggleProjectExpansion = (projId) => {
    const index = expandedProjects.value.indexOf(projId);
    if (index === -1) {
      expandedProjects.value.push(projId);
    } else {
      expandedProjects.value.splice(index, 1);
    }
  };

  onMounted(async () => {
    try {
      await projStore.initializeStore(authStore.user.userId);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: '로드 실패',
        detail: '프로젝트를 불러오는데 실패했습니다.',
        life: 3000
      });
    }
  });

  onUnmounted(() => {
    activeWorkspace.value = null;
    activeProject.value = null;
    expandedProjects.value = [];
  });
</script>

<style scoped>
  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }

  .proj-main {
    flex: 1
  }
</style>