<!-- SideBar.vue -->
<template>
    <div class="sidebar">
        <ProjItem v-for="(project, id) in props.projs" :key="id" :project="project">
            <template v-if="project.workspaces?.length">
                <WorkspaceItem v-for="workspace in project.workspaces" :key="workspace.workspace_id"
                    :workspace="workspace" />
            </template>
        </ProjItem>
    </div>
</template>

<script setup>
    import ProjItem from './ProjItem.vue';
    import WorkspaceItem from './WorkspaceItem.vue';

    const props = defineProps({
        projs: {
            type: Object,
            required: true
        }
    });
</script>