<template>
    <div class="sidebar">
        <PanelMenu :model="menuItems" class="w-full border-none" @item-toggle="handleToggle"
            v-model:expandedKeys="expandedKeys">
            <template #item="{ item }">
                <div class="flex items-center justify-between w-full">
                    <span class="menu-label">{{ item.label }}</span>
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
                            <i class="pi" :class="expandedKeys[item.key] ? 'pi-chevron-down' : 'pi-chevron-up'"></i>
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
    const expandedKeys = ref({});

    const props = defineProps({
        projs: {
            type: Object,
            required: true
        }
    });

    const emit = defineEmits(['update:bookmarks']);

    const handleToggle = (event) => {
        const itemKey = event.item.key;
        expandedKeys.value[itemKey] = !expandedKeys.value[itemKey];
    };

    const toggleBookmark = (item) => {
        item.isActive = !item.isActive;
        emit('update:bookmarks', item);
    };

    const menuItems = computed(() => {
        if (!props.projs) return [];

        return Object.entries(props.projs).map(([key, project]) => ({
            key: `project-${key}`,  // 고유 키 추가
            label: project.proj_name,
            bookmarkIcon: 'pi pi-bookmark',
            isActive: project.isActive || false,
            items: project.workspaces?.map((workspace, index) => ({
                key: `workspace-${key}-${index}`,  // 고유 키 추가
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
        background: transparent !important;
    }

    .sidebar :deep(.p-panelmenu-content) {
        padding: 0;
        background: transparent;
    }

    .sidebar :deep(.p-menuitem-link) {
        padding: 0.75rem 1rem 0.75rem 2rem;
        background: transparent !important;
    }

    .menu-label {
        font-weight: 500;
    }

    .bookmark-container {
        position: relative;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .bookmark-icon {
        color: #FF8FAB;
        font-size: 1.2rem;
        transition: color 0.3s ease;
    }

    .bookmark-icon.active {
        color: #FF4777;
    }

    .chevron-container {
        display: inline-flex;
        align-items: center;
        color: #666;
    }

    .chevron-container i {
        font-size: 0.9rem;
        transition: transform 0.3s ease;
    }

    .sidebar :deep(.p-menuitem-icon) {
        color: #FFB156;
        margin-left: auto;
    }

    .sidebar :deep(.p-panelmenu-icon) {
        display: none;
    }

    .sidebar :deep(.p-panelmenu .p-panelmenu-header),
    .sidebar :deep(.p-panelmenu .p-panelmenu-content),
    .sidebar :deep(.p-menuitem) {
        border: none;
    }

    .sidebar :deep(.p-panelmenu-header-link:focus) {
        box-shadow: none;
    }

    .sidebar :deep(.p-panelmenu .p-panelmenu-content .p-menuitem .p-menuitem-link:not(.p-disabled):hover) {
        background: var(--surface-50) !important;
    }
</style>