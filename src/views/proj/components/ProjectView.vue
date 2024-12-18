<template>

    <div class="h-12 flex flex-row items-center justify-between underline-gray">

        <!-- title -->
        <h1 class="text-2xl text-center">{{ project?.proj_name }}</h1>
        <div class="flex flex-row items-center justify-between">
            <Button severity="contrast" text>
                <GitBranch></GitBranch>
            </Button>

        </div>
    </div>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { useWorkspaceStore } from '@/stores/proj/useWorkspaceStore';
    import { GitBranch } from 'lucide-vue-next';
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();

    // Compute active project ID from route
    const activeProjectId = computed(() => route.params.projectId);

    // Compute the active project
    const project = computed(() =>
        activeProjectId.value ? projectStore.projects[activeProjectId.value] : null
    );
</script>