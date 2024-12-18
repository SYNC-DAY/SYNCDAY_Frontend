<template>
    <div class="flex flex-row justify-center"></div>
    <span class="text-lg">{{ project?.proj_name }}</span>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { useWorkspaceStore } from '@/stores/proj/useWorkspaceStore';
    import { onMounted, ref } from 'vue';

    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();
    const project = ref(null);

    onMounted(() => {
        // Get the active project from store
        project.value = projectStore.projects[projectStore.activeId];
    });
</script>

<style lang="scss" scoped></style>