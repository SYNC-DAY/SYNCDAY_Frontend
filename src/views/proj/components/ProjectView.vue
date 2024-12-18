<template>
    <div>
        <!-- Debug info -->
        <pre>Active ID: {{ projectStore.activeId }}</pre>
        <pre>Projects: {{ JSON.stringify(projectStore.projects, null, 2) }}</pre>

        <h1>{{ project?.proj_name }}</h1>
    </div>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { useWorkspaceStore } from '@/stores/proj/useWorkspaceStore';
    import { onMounted, ref, watch } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();
    const project = ref(null);

    onMounted(async () => {
        console.log('Component mounted');
        console.log('Route params:', route.params);
        console.log('Store state:', projectStore.$state);

        const projectId = route.params.projectId;
        console.log('Project ID from route:', projectId);

        // If your projects need to be fetched first:
        if (!projectStore.projects || Object.keys(projectStore.projects).length === 0) {
            await projectStore.fetchProjects(); // Assuming you have this action
        }

        if (projectId && projectStore.projects[projectId]) {
            projectStore.setActive(projectId);
            project.value = projectStore.projects[projectId];
        }
    });

    // Watch for changes in the active project
    watch(
        () => projectStore.activeId,
        (newId) => {
            if (newId && projectStore.projects[newId]) {
                project.value = projectStore.projects[newId];
            }
        }
    );
</script>