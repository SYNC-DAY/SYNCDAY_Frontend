<template>

    <div class="h-20 flex flex-row items-center justify-between underline-gray">

        <!-- title -->
        <h1 class="text-2xl text-center">{{ project?.proj_name }}</h1>
        <div class="flex flex-row items-center justify-between">
            <Button severity="contrast" text icon="pi pi-cog"></Button>
            <Button severity="contrast" text @click="toggleVcsMenu" aria-controls="overlay-menu">
                <GitBranch class="h-4"></GitBranch>
            </Button>
            <VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
        </div>

        <ProjGithubIntegrationModal v-model:visible="showProjVcsSettings" :project-id="projectId" :project="project"
            @update:project="updateProjectInfo" />
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
    /* stores */
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();

    /* utils */
    const route = useRoute();
    const toast = useToast();

    /* components */
    const vcsMenu = ref(null);
    const showProjVcsSettings = ref(false);
    /* computed */
    const activeProjectId = computed(() => route.params.projectId);

    /* methods */
    const toggleVcsMenu = event => {
        vcsMenu.value?.toggle(event);
    }
    const handleVcsSelection = async vcsType => {
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
    // Compute the active project
    const project = computed(() =>
        activeProjectId.value ? projectStore.projects[activeProjectId.value] : null
    );
</script>