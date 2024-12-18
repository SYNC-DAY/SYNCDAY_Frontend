<template>
    <Dialog :visible="visible" @update:visible="handleVisibilityChange" :modal="true" class=""
        :style="{ width: '70vw' }" header="Github Integration">
        <div class="container-col gap-1rem">
            <!-- Connected Organizations -->
            <div class="organizations-section">
                <div class="section-header">
                    <strong>Connected organizations</strong>
                    <Button icon="pi pi-plus" class="p-button-text" @click="addOrganization" />
                </div>

                <div class="organizations-list">
                    <div v-for="installation in githubAppStore.installations" :key="installation.id" class="org-item">
                        <div class="org-select">
                            <RadioButton :value="installation.id" v-model="selectedInstallationId"
                                :inputId="'org_' + installation.id" />
                        </div>
                        <div class="org-info">
                            <Avatar :image="installation.avatarUrl" :label="getInitials(installation.accountName)"
                                shape="square" size="large" class="org-avatar" />
                            <div class="org-details">
                                <span class="org-name">{{ installation.accountName }}</span>
                                <span class="org-date">Enabled on {{ formatDate(installation.createdAt) }}</span>
                            </div>
                        </div>
                        <div class="org-status">
                            <span class="status-dot"></span>
                            <span>Connected</span>
                            <Button icon="pi pi-chevron-down" @click="event => openMenu(event, installation.id)"
                                aria-haspopup="true" aria-controls="overlay_menu" class="p-button-text" />
                        </div>
                    </div>
                </div>

                <div v-if="selectedInstallationId && githubProjects.length > 0" class="projects-section">
                    <div class="section-header">
                        <strong>Projects</strong>
                        <span class="text-sm text-gray-500">Select a project to connect</span>
                    </div>

                    <div class="projects-list">
                        <div v-for="project in githubProjects" :key="project.id" class="project-item"
                            :class="{ selected: selectedProjectId === project.id }">
                            <div class="project-select">
                                <RadioButton :value="project.id" :inputId="'project_' + project.id"
                                    v-model:model-value="selectedGithubProjectId"
                                    @change="handleProjectSelect(project.id)" />
                            </div>
                            <div class="project-info">
                                <div class="project-details">
                                    <span class="project-name">{{ project.title }}</span>
                                    <span class="project-meta">Updated {{ formatDate(project.updatedAt) }}</span>
                                </div>
                                <div class="project-stats">
                                    <span class="stat-item">
                                        <i class="pi pi-file mr-1"></i>
                                        {{ project.open_issues_count }} open issues
                                    </span>
                                    <span class="stat-item">
                                        <i class="pi pi-users mr-1"></i>
                                        {{ project.watchers_count }} watchers
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container-row justify-right">
                <Button label="Save" :loading="loading" :disabled="!selectedInstallationId" @click="handleSave"
                    class="p-button-primary" />
            </div>
            <Menu ref="menu" :model="currentMenuItems" :popup="true" />
        </div>
    </Dialog>
    <!-- Add ConfirmDialog component here -->
    <ConfirmDialog />
</template>

<script setup>
    import { useGithubAppStore } from "@/stores/github/useGithubAppStore";
    import { useGithubProjectsStore } from "@/stores/github/useGithubProjectsStore";
    import { useProjectStore } from "@/stores/proj/useProjectStore";
    import ConfirmDialog from "primevue/confirmdialog";
    import RadioButton from "primevue/radiobutton";
    import { useConfirm } from "primevue/useconfirm";
    import { useToast } from "primevue/usetoast";
    import { onMounted, onUnmounted, ref, watch } from "vue";

    // Props
    const props = defineProps({
        visible: {
            type: Boolean,
            required: true,
        },
        projectId: {
            type: Number,
            required: true,
        },
        projectData: {
            type: Object,
            required: true,
        },
    });

    const emit = defineEmits(["update:visible", "update:project"]);

    /* stores */
    const projectStore = useProjectStore();
    const githubAppStore = useGithubAppStore();
    const githubProjectStore = useGithubProjectsStore();
    const toast = useToast();
    const confirm = useConfirm();

    // State
    const menu = ref(null);
    const currentMenuItems = ref([]);
    const currentInstallationId = ref(null);
    const loading = ref(false);
    const error = ref(null);
    const selectedInstallationId = ref(null);
    const selectedGithubProjectId = ref(null);
    const githubProjects = ref([]); // Initialize as empty array instead of null

    // Open menu with correct items
    const openMenu = (event, installationId) => {
        event.stopPropagation();
        currentInstallationId.value = installationId;

        currentMenuItems.value = [
            {
                label: "Options",
                items: [
                    {
                        label: "Disable",
                        icon: "pi pi-trash",
                        command: () => {
                            confirm.require({
                                message: "Are you sure you want to disable this GitHub installation?",
                                header: "Confirm Disable",
                                icon: "pi pi-exclamation-triangle",
                                acceptClass: "p-button-danger",
                                accept: async () => {
                                    try {
                                        loading.value = true;
                                        await githubAppStore.disableInstallation(installationId);
                                        toast.add({
                                            severity: "success",
                                            summary: "Success",
                                            detail: "GitHub installation disabled successfully",
                                            life: 3000,
                                        });
                                        await githubAppStore.fetchInstallations();
                                    } catch (error) {
                                        toast.add({
                                            severity: "error",
                                            summary: "Error",
                                            detail: error.message || "Failed to disable installation",
                                            life: 3000,
                                        });
                                    } finally {
                                        loading.value = false;
                                    }
                                },
                                reject: () => {
                                    // Optional: Handle rejection
                                },
                            });
                        },
                    },
                ],
            },
        ];

        menu.value.show(event);
    };

    // Methods
    const handleVisibilityChange = newValue => {
        emit("update:visible", newValue);
    };

    const getInitials = name => {
        return name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const formatDate = date => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const addOrganization = () => {
        githubAppStore.openInstallationWindow();
    };

    const handleInstallationSelect = id => {
        selectedInstallationId.value = id;
    };

    const handleProjectSelect = id => {
        selectedGithubProjectId.value = id;
    };

    watch(selectedInstallationId, async newVal => {
        if (newVal) {
            try {
                loading.value = true;
                const installation = githubAppStore.installations[newVal];

                if (installation) {
                    githubProjects.value = await githubProjectStore.fetchOrgProjects(newVal, installation.accountName);
                }
            } catch (error) {
                toast.add({
                    severity: "error",
                    summary: "Error",
                    detail: "Failed to fetch projects: " + error.message,
                    life: 3000,
                });
            } finally {
                loading.value = false;
            }
        }
    });

    const confirmRevokeAccess = () => {
        confirm.require({
            message: "Are you sure you want to revoke GitHub access?",
            header: "Revoke Access",
            icon: "pi pi-exclamation-triangle",
            acceptClass: "p-button-danger",
            accept: async () => {
                try {
                    await githubAuthStore.revokeAccess();
                    toast.add({
                        severity: "success",
                        summary: "Success",
                        detail: "GitHub access has been revoked",
                        life: 3000,
                    });
                } catch (error) {
                    toast.add({
                        severity: "error",
                        summary: "Error",
                        detail: "Failed to revoke access",
                        life: 3000,
                    });
                }
            },
            reject: () => {
                // Optional: Handle rejection
            },
        });
    };

    const handleAuthMessage = async event => {
        if (event.origin !== window.location.origin) return;

        const { type, data } = event.data;

        const toastMessages = {
            "github-auth-success": {
                severity: "success",
                summary: "Success",
                detail: "GitHub account connected successfully",
            },
            "github-installation-success": {
                severity: "success",
                summary: "Success",
                detail: "GitHub app installed successfully",
            },
            "github-error": {
                severity: "error",
                summary: "Error",
                detail: data || "GitHub operation failed",
            },
        };

        if (type in toastMessages) {
            if (["github-auth-success", "github-installation-success"].includes(type)) {
                await githubAppStore.fetchInstallations();
            }

            toast.add({
                ...toastMessages[type],
                life: 3000,
            });
        }
    };

    const handleSave = async () => {
        if (!selectedInstallationId.value) return;

        const selectedInstallation = githubAppStore.installations[selectedInstallationId.value];
        const selectedProject = githubProjects.value?.find(p => p.id === selectedGithubProjectId.value);

        if (selectedInstallation) {
            loading.value = true;
            error.value = null;

            try {
                const updatedProject = {
                    ...props.projectData,
                    vcs_type: "GITHUB",
                    vcs_proj_url: selectedProject?.url || selectedInstallation.htmlUrl || "",
                    github_installation_id: selectedInstallation.id,
                };

                await projectStore.updateProject(updatedProject);
                emit("update:project", updatedProject);
                emit("update:visible", false);
            } catch (err) {
                error.value = err instanceof Error ? err.message : "Failed to update GitHub integration";
                console.error("GitHub integration error:", err);
            } finally {
                loading.value = false;
            }
        }
    };

    // Lifecycle hooks
    onMounted(() => {
        githubAppStore.fetchInstallations();
        window.addEventListener("message", handleAuthMessage);
    });

    onUnmounted(() => {
        window.removeEventListener("message", handleAuthMessage);
        githubAppStore.cleanup();
    });
</script>
<style scoped>
    .content-section {
        padding: 1rem 2rem;
    }

    .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 2rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .organizations-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .org-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--linear-border);
    }

    .org-info {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .org-avatar {
        background: var(--linear-border);
    }

    .org-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .org-name {
        font-weight: 500;
    }

    .org-date {
        font-size: 0.875rem;
        color: var(--linear-text-secondary);
    }

    .org-status {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #3fb950;
    }

    .repository-section {
        margin-top: 2rem;
    }

    .repository-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .repo-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 4px;
    }

    .repo-name {
        font-size: 0.875rem;
    }

    .import-options {
        margin-top: 2rem;
    }

    .option-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }

    :deep(.p-dialog-content) {
        padding: 0;
        background: #1c1c1f;
    }

    :deep(.p-dialog-header) {
        display: none;
    }

    :deep(.p-checkbox) {
        width: 1.25rem;
        height: 1.25rem;
    }

    :deep(.p-button.p-button-text) {
        color: var(--linear-text-secondary);
    }

    :deep(.p-button.p-button-text:hover) {
        background: rgba(255, 255, 255, 0.1);
    }

    .org-select {
        margin-right: 1rem;
    }

    .org-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-radius: 6px;
        border: 1px solid var(--linear-border);
        cursor: pointer;
    }

    .projects-list {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .project-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid var(--surface-border);
        background: var(--surface-card);
        transition: all 0.2s;
    }

    .project-item:hover {
        background: var(--surface-hover);
    }

    .project-item.selected {
        border-color: var(--primary-color);
        background: var(--primary-50);
    }

    .project-select {
        margin-right: 1rem;
    }

    .project-info {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .project-details {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .project-name {
        font-weight: 600;
        color: var(--text-color);
    }

    .project-meta {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
    }

    .project-stats {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .stat-item {
        display: flex;
        align-items: center;
        font-size: 0.875rem;
        color: var(--text-color-secondary);
    }
</style>