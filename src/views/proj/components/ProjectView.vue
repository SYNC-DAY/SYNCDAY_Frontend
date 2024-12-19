<template>
    <div v-if="!project" class="h-20 flex items-center justify-center">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
    </div>

    <div v-else class="h-20 flex flex-row items-center justify-between underline-gray">
        <!-- title -->
        <h1 class="text-2xl text-center">{{ project.proj_name }}</h1>

        <div class="flex flex-row items-center gap-2">
            <Button severity="contrast" text icon="pi pi-cog" />
            <Button severity="contrast" text @click="toggleVcsMenu" aria-controls="overlay-menu">
                <GitBranch class="h-4" />
            </Button>
            <VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
        </div>

        <ProjGithubIntegrationModal v-model:visible="showProjVcsSettings" :project-id="projectId" :project="project"
            @update:project="updateProject" />
    </div>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { useWorkspaceStore } from '@/stores/proj/useWorkspaceStore';
    import { GitBranch } from 'lucide-vue-next';
    import { useToast } from 'primevue/usetoast';
    import { computed, ref } from 'vue';
    import { useRoute } from 'vue-router';
    import ProjGithubIntegrationModal from './utils/ProjGithubIntegrationModal.vue';
    import VcsTypeMenu from './utils/VcsTypeMenu.vue';

    // Stores
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();

    // Utils
    const route = useRoute();
    const toast = useToast();

    // State
    const vcsMenu = ref(null);
    const showProjVcsSettings = ref(false);

    // Computed
    const projectId = computed(() => route.params.projectId);
    const project = computed(() => projectStore.projects[projectId.value]);

    // Methods
    const toggleVcsMenu = (event) => {
        vcsMenu.value?.toggle(event);
    };

    const handleVcsSelection = async (vcsType) => {
        try {
            if (vcsType === "GITHUB") {
                showProjVcsSettings.value = true;
            }
        } catch (error) {
            toast.add({
                severity: "error",
                summary: "VCS Connection Failed",
                detail: error.message,
                life: 3000,
            });
        }
    };

    const updateProject = async (updatedProject) => {
        try {
            await projectStore.updateProject(updatedProject);
            toast.add({
                severity: 'success',
                summary: 'Project Updated',
                detail: 'Project settings have been updated successfully',
                life: 3000,
            });
        } catch (err) {
            toast.add({
                severity: 'error',
                summary: 'Update Failed',
                detail: err.message,
                life: 3000,
            });
        }
    };
</script>