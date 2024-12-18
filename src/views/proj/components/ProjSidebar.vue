<template>
    <div class="sidebar custom-scrollpanel">
        <ScrollPanel class="w-full h-full">
            <PanelMenu :model="menuItems" class="w-full border-none" v-model:expandedKeys="expandedKeysValue"
                @item-toggle="preventDefault">
                <template #item="{ item }">
                    <div class="flex flex-row items-center justify-between w-full h-16 project-item"
                        :class="{ 'is-active': isActiveProject(item) }" @click.stop="handleItemClick(item)">
                        <div>
                            <span class="menu-label truncate" :class="{ 'font-semibold': isProjectItem(item) }">
                                {{ item.label }}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div v-if="isProjectItem(item)" class="bookmark-container">
                                <i class="bookmark-icon pi pi-bookmark" :class="{ 'active': isBookmarked(item) }"
                                    @click.stop="toggleProjectBookmark(item)"></i>
                            </div>
                            <i v-if="isWorkspaceItem(item)" :class="item.icon"></i>
                            <span v-if="isProjectItem(item)" class="chevron-container"
                                @click.stop="handleChevronClick(item)">
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
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { useWorkspaceStore } from '@/stores/proj/useWorkspaceStore';
    import { storeToRefs } from 'pinia';
    import PanelMenu from 'primevue/panelmenu';
    import ScrollPanel from 'primevue/scrollpanel';
    import { computed, onMounted, ref, watch } from 'vue';
    import { useRoute, useRouter } from 'vue-router';

    const router = useRouter();
    const route = useRoute();
    const expandedKeysValue = ref({});

    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();
    const { projectsArray } = storeToRefs(projectStore);

    onMounted(async () => {
        if (projectStore.shouldRefetch) {
            await projectStore.getProjects(userId);
        }
    });

    watch(() => projectStore.hasProjects, async (hasProjects) => {
        if (hasProjects) {
            await workspaceStore.loadWorkspacesForProjects();
        }
    }, { immediate: true });

    const isProjectItem = (item) => item?.key?.startsWith('project-');
    const isWorkspaceItem = (item) => item?.key?.startsWith('workspace-');

    // PanelMenu의 기본 토글 이벤트 방지
    const preventDefault = (event) => {
        event.preventDefault?.();
    };

    // Chevron 클릭 시에만 토글되도록 처리
    const handleChevronClick = (item) => {
        expandedKeysValue.value = {
            ...expandedKeysValue.value,
            [item.key]: !expandedKeysValue.value[item.key]
        };
    };

    const getProjectIdFromItem = (item) => {
        if (isProjectItem(item)) {
            return item.key.split('-')[1];
        }
        return item.key.split('-')[1];
    };

    const isBookmarked = (item) => {
        if (!isProjectItem(item)) return false;
        const projectId = getProjectIdFromItem(item);
        const project = projectStore.getProjectById(projectId);
        return project?.bookmark_status === 'BOOKMARKED';
    };

    const toggleProjectBookmark = async (item) => {
        const projectId = getProjectIdFromItem(item);
        const projMemberId = projectStore.getProjectById(projectId)?.proj_member_id;
        if (projMemberId) {
            await projectStore.updateProjectMemberStatus(projMemberId, {
                bookmark_status: isBookmarked(item) ? 'NONE' : 'BOOKMARKED'
            });
        }
    };

    const handleItemClick = (item) => {
        if (isProjectItem(item)) {
            const projectId = getProjectIdFromItem(item);
            router.push(`/project/${projectId}`);

        }
        else if (isWorkspaceItem(item)) {
            const [, projectId, workspaceId] = item.key.split('-');
            router.push(`/project/${projectId}/workspace/${workspaceId}`);
        }
    };
    const isActiveProject = (item) => {
        if (!item || !route.params.projectId) return false;

        if (isProjectItem(item)) {
            const projectId = getProjectIdFromItem(item);
            return projectId === route.params.projectId;
        }

        const [, projectId] = item.key.split('-');
        return projectId === route.params.projectId;
    };

    const menuItems = computed(() => {
        if (!projectStore.hasProjects) return [];

        return projectsArray.value.map(project => ({
            key: `project-${project.proj_id}`,
            label: project.proj_name,
            bookmarkIcon: 'pi pi-bookmark',
            items: workspaceStore.getWorkspacesByProjectId(project.proj_id).map(workspace => ({
                key: `workspace-${project.proj_id}-${workspace.workspace_id}`,
                label: workspace.workspace_name,
                icon: 'pi pi-star',

            }))
        }));
    });

    watch(
        () => route.params,
        (params) => {
            if (params.projectId) {
                projectStore.setActive(params.projectId);
                workspaceStore.setActive(params.workspaceId || null);
            }
        },
        { immediate: true }
    );
</script>

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