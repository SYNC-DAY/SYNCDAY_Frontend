<template>
    <div class="sidebar custom-scrollpanel">
        <ScrollPanel class="w-full h-full">
            <PanelMenu :model="menuItems" class="w-full border-none" @item-toggle="handleToggle"
                v-model:expandedKeys="expandedKeysValue">
                <template #item="{ item }">
                    <div class="flex flex-row items-center justify-between w-full h-16 project-item"
                        :class="{ 'is-active': isActiveProject(item) }">
                        <div>

                            <span class="menu-label truncate"
                                :class="{ 'font-semibold': item.key.includes('project') }">{{ item.label
                                }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div v-if="!item.command" class="bookmark-container">
                                <i class="bookmark-icon pi pi-bookmark" :class="{ 'active': item.isActive }"
                                    @click.stop="toggleBookmark(item)"></i>
                            </div>
                            <i v-if="item.command" :class="item.icon"></i>
                            <span v-if="!item.command" class="chevron-container">
                                <i class="pi"
                                    :class="expandedKeysValue[item.key] ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                            </span>
                        </div>
                    </div>
                </template>
            </PanelMenu>
        </ScrollPanel>
    </div>
</template>

<script setup>
    import PanelMenu from 'primevue/panelmenu';
    import ScrollPanel from 'primevue/scrollpanel';
    import { computed, ref } from 'vue';
    import { useRoute, useRouter } from 'vue-router';

    const router = useRouter();
    const route = useRoute();
    const expandedKeysValue = ref({});

    const props = defineProps({
        projs: {
            type: Object,
            required: true
        }
    });

    const emit = defineEmits(['update:bookmarks']);

    const handleToggle = (event) => {
        expandedKeysValue.value = {
            ...expandedKeysValue.value,
            [event.item.key]: !expandedKeysValue.value[event.item.key]
        };
    };

    const toggleBookmark = (item) => {
        item.isActive = !item.isActive;
        emit('update:bookmarks', item);
    };

    const isActiveProject = (item) => {
        if (!item || !route.params.projectId) return false;

        // Check if this is a project item (not a workspace)
        if (!item.command) {
            const projectKey = item.key.split('-')[1];
            return projectKey === route.params.projectId;
        }

        // For workspace items, check if they belong to the active project
        const [, projectKey] = item.key.split('-');
        return projectKey === route.params.projectId;
    };

    const menuItems = computed(() => {
        if (!props.projs) return [];

        return Object.entries(props.projs).map(([key, project]) => ({
            key: `project-${key}`,
            label: project.proj_name,
            bookmarkIcon: 'pi pi-bookmark',
            isActive: project.isActive || false,
            items: project.workspaces?.map((workspace) => ({
                key: `workspace-${key}-${workspace.workspace_id}`,
                label: workspace.workspace_name,
                icon: 'pi pi-star',
                command: () => {
                    // Fixed router navigation
                    router.push(`/project/${project.proj_id}/workspace/${workspace.workspace_id}`);
                }
            })) || []
        }));
    });
</script>

<!-- Style section remains unchanged -->
<style scoped>
    .sidebar {
        position: relative;
        height: 100%;
    }

    /* ScrollPanel customization */
    :deep(.p-scrollpanel-wrapper) {
        border-right: none;
    }

    :deep(.p-scrollpanel-bar) {
        background-color: var(--p-gray-300, --p-gray-900) !important;
        border-radius: 2;
        opacity: 0.5;
        width: 5px;
    }

    :deep(.p-scrollpanel-bar:hover) {
        opacity: 0.5;
    }

    :deep(.p-scrollpanel-content) {
        /* padding-right: 8px; */
    }

    /* PanelMenu styling */
    :deep(.p-panelmenu) {
        border: none;
        padding: 0 0.5rem;
    }

    :deep(.p-panelmenu-panel) {
        min-height: 4rem;
    }

    :deep(.p-panelmenu-header) {
        height: 4rem;
    }

    :deep(.p-panelmenu-header-link) {
        position: relative;
        /* Enable positioning for ::before */
    }

    .project-item.is-active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: auto;
        width: 4px;
        background: linear-gradient(to bottom, #FF8FAB, #FFB156);
        border-radius: 0 2px 2px 0;
    }

    /* Optional: Add a subtle background for active items */
    .project-item.is-active {
        background-color: var(--surface-50);
    }

    /* Ensure proper positioning of the indicator */
    :deep(.p-panelmenu-header) {
        position: relative;
        overflow: visible;
    }

    :deep(.p-panelmenu-header-link:hover) {
        background-color: var(--surface-50) !important;
    }

    :deep(.p-panelmenu-content) {
        padding: 0;
        background: transparent;
    }

    :deep(.p-menuitem-link) {
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        height: 3.5rem;
        background: transparent !important;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
    }

    .menu-label {
        /* font-weight: 500; */
        color: var(--p-text-color);
        font-size: 1rem;

    }

    .bookmark-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    .bookmark-container:hover {
        background-color: var(--surface-100);
    }

    .bookmark-icon {
        color: #FF8FAB;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .bookmark-icon.active {
        color: #FF4777;
        transform: scale(1.1);
    }

    .chevron-container {
        display: inline-flex;
        align-items: center;
        color: #666;
        width: 24px;
        height: 24px;
        justify-content: center;
    }

    .chevron-container i {
        font-size: 1rem;
        transition: transform 0.3s ease;
    }

    :deep(.p-menuitem-icon) {
        color: #FFB156;
        font-size: 1rem;
    }

    :deep(.p-panelmenu-icon) {
        display: none;
    }

    :deep(.p-panelmenu .p-panelmenu-panel),
    :deep(.p-panelmenu .p-panelmenu-header),
    :deep(.p-panelmenu .p-panelmenu-content),
    :deep(.p-menuitem) {
        border: none;
        margin: 0;
    }

    :deep(.p-panelmenu-header-link:focus) {
        box-shadow: none;
    }

    :deep(.p-menuitem-link:hover) {
        background-color: var(--surface-50) !important;
    }

    :deep(.p-menuitem-link.p-highlight) {
        background-color: var(--surface-100) !important;
    }
</style>