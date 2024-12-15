<template>
    <div class="sidebar">
        <PanelMenu :model="menuItems" class="w-full border-none">
            <template #item="{ item }">
                <div class="flex items-center justify-between w-full">
                    <span>{{ item.label }}</span>
                    <div class="flex items-center gap-2">
                        <i :class="item.icon"></i>
                        <i :class="item.expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"></i>
                    </div>
                </div>
            </template>
        </PanelMenu>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const props = defineProps({
        projs: {
            type: Object,
            required: true
        }
    });

    const menuItems = computed(() => {
        if (!props.projs) return [];

        return Object.values(props.projs).map(project => ({
            label: project.proj_name,
            icon: 'pi pi-bookmark',
            expanded: false,
            items: project.workspaces?.map(workspace => ({
                label: workspace.workspace_name,
                icon: 'pi pi-star',
                command: () => {
                    router.push(`/workspace/${workspace.workspace_id}`);
                }
            })) || []
        }));
    });
</script>

<style scoped>
    .sidebar {
        padding: 0.5rem;
    }

    .sidebar :deep(.p-panelmenu) {
        border: none;
    }

    .sidebar :deep(.p-panelmenu-header-link) {
        padding: 0.75rem 1rem;
    }

    .sidebar :deep(.p-panelmenu-content) {
        padding: 0;
    }

    .sidebar :deep(.p-menuitem-link) {
        padding: 0.75rem 1rem 0.75rem 2rem;
    }

    .sidebar :deep(.p-menuitem-text) {
        margin-right: auto;
    }

    .sidebar :deep(.p-menuitem-icon) {
        order: 2;
        margin-left: auto;
    }

    .sidebar :deep(.p-menuitem-icon),
    .sidebar :deep(.p-panelmenu-header-icon) {
        color: var(--primary-color);
    }

    .sidebar :deep(.p-panelmenu-header-link:focus) {
        box-shadow: none;
    }

    .sidebar :deep(.p-panelmenu .p-panelmenu-content .p-menuitem .p-menuitem-link:not(.p-disabled):hover) {
        background: var(--surface-hover);
    }

    /* Remove default PanelMenu icons */
    .sidebar :deep(.p-panelmenu-icon) {
        display: none;
    }

    /* Adjust flex layout for menu items */
    .sidebar :deep(.p-menuitem-link) {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>