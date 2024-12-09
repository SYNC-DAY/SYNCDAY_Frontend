<template>
  <div v-if="workspace" class="p-6">
    <header class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <div class="space-y-1">
          <div class="text-sm text-gray-500">
            <RouterLink :to="{ name: 'Project', params: { projectId: projectId } }">
              {{ project?.proj_name }}
            </RouterLink>
            <i class="pi pi-angle-right mx-2" />
            {{ workspace.workspace_name }}
          </div>
          <h1 class="text-2xl font-bold">{{ workspace.workspace_name }}</h1>
        </div>
        <div class="flex gap-2">
          <Button icon="pi pi-cog" @click="showSettings = true" />
        </div>
      </div>

      <div class="flex gap-4 text-sm text-gray-600">
        <div>
          <i class="pi pi-chart-bar mr-2" />
          진행률: {{ workspace.progress_status }}%
        </div>
        <div v-if="workspace.vcs_type">
          <i :class="`pi ${getVcsIcon(workspace.vcs_type)} mr-2`" />
          {{ workspace.vcs_repo_url || 'Repository not linked' }}
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Workspace Progress Card -->
      <Card class="shadow-sm">
        <template #title>Progress Overview</template>
        <template #content>
          <div class="space-y-4">
            <ProgressBar :value="workspace.progress_status" />
            <div class="flex justify-between text-sm">
              <span>Tasks Completed: {{ completedTasks }}/{{ totalTasks }}</span>
              <Button icon="pi pi-sync" text @click="refreshProgress" :loading="isRefreshing" />
            </div>
          </div>
        </template>
      </Card>

      <!-- Repository Info Card -->
      <Card v-if="workspace.vcs_type" class="shadow-sm">
        <template #title>Repository Information</template>
        <template #content>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <i :class="`pi ${getVcsIcon(workspace.vcs_type)}`" />
              <span>{{ workspace.vcs_type }}</span>
            </div>
            <div v-if="workspace.vcs_repo_url" class="text-sm break-all">
              <a :href="workspace.vcs_repo_url" target="_blank" class="text-blue-600 hover:underline">
                {{ workspace.vcs_repo_url }}
              </a>
            </div>
            <div v-else class="text-sm text-gray-500">
              No repository linked
              <Button label="Link Repository" icon="pi pi-link" text @click="showLinkRepoModal = true" />
            </div>
          </div>
        </template>
      </Card>

      <!-- Activity Feed Card -->
      <Card class="shadow-sm">
        <template #title>Recent Activity</template>
        <template #content>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="activity in recentActivities" :key="activity.id" class="p-2 text-sm border-b last:border-b-0">
              <div class="flex items-center gap-2">
                <i :class="`pi ${getActivityIcon(activity.type)}`" />
                <span>{{ activity.description }}</span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatDate(activity.timestamp) }}
              </div>
            </div>
            <div v-if="!recentActivities.length" class="text-sm text-gray-500 text-center py-4">
              No recent activity
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Settings Dialog -->
    <Dialog v-model:visible="showSettings" header="Workspace Settings" :modal="true">
      <WorkspaceSettingsForm :workspace="workspace" @submit="handleSettingsSubmit" @delete="handleWorkspaceDelete" />
    </Dialog>

    <!-- Link Repository Dialog -->
    <Dialog v-model:visible="showLinkRepoModal" header="Link Repository" :modal="true">
      <LinkRepositoryForm :workspace="workspace" @submit="handleLinkRepository" />
    </Dialog>
  </div>
  <div v-else class="flex justify-center items-center h-full">
    <ProgressSpinner v-if="isLoading" />
    <div v-else class="text-gray-500">Workspace not found</div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useProjectStore } from '@/stores/proj/useProjectStore';
  import { useToast } from 'primevue/usetoast';

  // Components
  import Card from 'primevue/card';
  import Dialog from 'primevue/dialog';
  import ProgressBar from 'primevue/progressbar';
  import ProgressSpinner from 'primevue/progressspinner';
  // import WorkspaceSettingsForm from './components/WorkspaceSettingsForm.vue';
  // import LinkRepositoryForm from './components/LinkRepositoryForm.vue';

  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const projectStore = useProjectStore();

  // Local state
  const showSettings = ref(false);
  const showLinkRepoModal = ref(false);
  const isRefreshing = ref(false);

  // Mock data (replace with real data from your API)
  const completedTasks = ref(5);
  const totalTasks = ref(10);
  const recentActivities = ref([
    {
      id: 1,
      type: 'commit',
      description: 'New commit: Update README.md',
      timestamp: new Date(Date.now() - 3600000)
    },
    // Add more activities...
  ]);

  // Computed properties
  const projectId = computed(() => parseInt(route.params.projectId));
  const workspaceId = computed(() => parseInt(route.params.workspaceId));

  const project = computed(() => projectStore.getProjectById(projectId.value));
  const workspace = computed(() => {
    if (!project.value) return null;
    return project.value.workspaces.find(w => w.workspace_id === workspaceId.value);
  });

  // Helper functions
  const getVcsIcon = (vcsType) => {
    return vcsType === 'GITHUB' ? 'pi-github' : 'pi-gitlab';
  };

  const getActivityIcon = (type) => {
    const icons = {
      commit: 'pi-code',
      issue: 'pi-exclamation-circle',
      pullRequest: 'pi-sync',
      default: 'pi-circle-fill'
    };
    return icons[type] || icons.default;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Methods
  const refreshProgress = async () => {
    isRefreshing.value = true;
    try {
      await projectStore.refreshWorkspaceProgress(projectId.value, workspaceId.value);
      toast.add({
        severity: 'success',
        summary: '진행률 업데이트',
        detail: '워크스페이스 진행률이 업데이트되었습니다.',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: '업데이트 실패',
        detail: '진행률 업데이트에 실패했습니다.',
        life: 3000
      });
    } finally {
      isRefreshing.value = false;
    }
  };

  const handleSettingsSubmit = async (updatedData) => {
    try {
      await projectStore.updateWorkspace(projectId.value, workspaceId.value, updatedData);
      showSettings.value = false;
      toast.add({
        severity: 'success',
        summary: '설정 업데이트',
        detail: '워크스페이스 설정이 업데이트되었습니다.',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: '업데이트 실패',
        detail: '워크스페이스 설정 업데이트에 실패했습니다.',
        life: 3000
      });
    }
  };

  const handleWorkspaceDelete = async () => {
    try {
      await projectStore.deleteWorkspace(projectId.value, workspaceId.value);
      router.push({
        name: 'Project',
        params: { projectId: projectId.value }
      });
      toast.add({
        severity: 'success',
        summary: '워크스페이스 삭제',
        detail: '워크스페이스가 삭제되었습니다.',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: '삭제 실패',
        detail: '워크스페이스 삭제에 실패했습니다.',
        life: 3000
      });
    }
  };

  const handleLinkRepository = async (repoData) => {
    try {
      await projectStore.linkWorkspaceRepository(
        projectId.value,
        workspaceId.value,
        repoData
      );
      showLinkRepoModal.value = false;
      toast.add({
        severity: 'success',
        summary: '저장소 연결',
        detail: '저장소가 연결되었습니다.',
        life: 3000
      });
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: '연결 실패',
        detail: '저장소 연결에 실패했습니다.',
        life: 3000
      });
    }
  };

  // Lifecycle hooks
  onMounted(() => {
    if (!workspace.value) {
      router.push({
        name: 'Project',
        params: { projectId: projectId.value }
      });
    }
  });
</script>