<template>
    <h1>{{ project?.proj_name }}</h1>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { useWorkspaceStore } from '@/stores/proj/useWorkspaceStore';
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