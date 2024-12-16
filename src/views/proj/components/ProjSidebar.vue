<template>
    <div class="sidebar">
        <PanelMenu :model="menuItems" class="w-full border-none" @item-toggle="handleToggle"
            v-model:expandedKeys="expandedKeysValue">
            <template #item="{ item }">
                <div class="flex flex-row items-center justify-between w-full h-16 px-4">
                    <span class="menu-label truncate">{{ item.label }}</span>
                    <div class="flex items-center gap-2">
                        <!-- Bookmark icon for project items -->
                        <div v-if="!item.command" class="bookmark-container">
                            <i class="bookmark-icon pi pi-bookmark" :class="{ 'active': item.isActive }"
                                @click.stop="toggleBookmark(item)"></i>
                        </div>
                        <!-- Star icon for workspace items -->
                        <i v-if="item.command" :class="item.icon"></i>
                        <!-- Custom chevron icon for project items -->
                        <span v-if="!item.command" class="chevron-container">
                            <i class="pi"
                                :class="expandedKeysValue[item.key] ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
                        </span>
                    </div>
                </div>
            </template>
        </PanelMenu>
    </div>
</template>

<script setup>
    import { computed, ref } from 'vue';
    import { useRouter } from 'vue-router';

    const router = useRouter();
    const expandedKeysValue = ref({}); // Renamed to be more explicit

    const props = defineProps({
        projs: {
            type: Object,
            required: true
        }
    });

    const emit = defineEmits(['update:bookmarks']);

    const handleToggle = (event) => {
        // Using the renamed ref
        expandedKeysValue.value = {
            ...expandedKeysValue.value,
            [event.item.key]: !expandedKeysValue.value[event.item.key]
        };
    };

    const toggleBookmark = (item) => {
        item.isActive = !item.isActive;
        emit('update:bookmarks', item);
    };

    const menuItems = computed(() => {
        if (!props.projs) return [];

        return Object.entries(props.projs).map(([key, project]) => ({
            key: `project-${key}`,
            label: project.proj_name,
            bookmarkIcon: 'pi pi-bookmark',
            isActive: project.isActive || false,
            items: project.workspaces?.map((workspace, index) => ({
                key: `workspace-${key}-${index}`,
                label: workspace.workspace_name,
                icon: 'pi pi-star',
                command: () => {
                    router.push(`${project.proj_id}/workspace/${workspace.workspace_id}`);
                }
            })) || []
        }));
    });
</script>

<style scoped>

    /* Styles remain the same as previous version */
    .sidebar :deep(.p-panelmenu) {
        border: none;
    }

    .sidebar :deep(.p-panelmenu-panel) {
        min-height: 4rem;
    }

    .sidebar :deep(.p-panelmenu-header) {
        height: 4rem;
    }

    .sidebar :deep(.p-panelmenu-header-link) {
        padding: 0 !important;
        height: 100%;
        background: transparent !important;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
    }

    .sidebar :deep(.p-panelmenu-header-link:hover) {
        background-color: var(--surface-50) !important;
    }

    .sidebar :deep(.p-panelmenu-content) {
        padding: 0;
        background: transparent;
    }

    .sidebar :deep(.p-menuitem-link) {
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        height: 3.5rem;
        background: transparent !important;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
    }

    .menu-label {
        font-weight: 500;
        color: #333;
        font-size: 0.95rem;
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

    .sidebar :deep(.p-menuitem-icon) {
        color: #FFB156;
        font-size: 1rem;
    }

    .sidebar :deep(.p-panelmenu-icon) {
        display: none;
    }

    .sidebar :deep(.p-panelmenu .p-panelmenu-panel),
    .sidebar :deep(.p-panelmenu .p-panelmenu-header),
    .sidebar :deep(.p-panelmenu .p-panelmenu-content),
    .sidebar :deep(.p-menuitem) {
        border: none;
        margin: 0;
    }

    .sidebar :deep(.p-panelmenu-header-link:focus) {
        box-shadow: none;
    }

    .sidebar :deep(.p-menuitem-link:hover) {
        background-color: var(--surface-50) !important;
    }

    .sidebar :deep(.p-menuitem-link.p-highlight) {
        background-color: var(--surface-100) !important;
    }
</style>