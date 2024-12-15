<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Drawer v-model:visible="visibleLeft" :closeOnEscape="false" position="left" class="w-full md:w-20rem">
                    <template #header>
                        <h2>Projects</h2>
                    </template>
                    <ProjSidebar :projs="projs" />
                </Drawer>

                <div class="flex flex-column">
                    <Button icon="pi pi-bars" @click="visibleLeft = true" severity="secondary"
                        class="fixed-button p-button-rounded" />
                    <div class="p-4">
                        <RouterView />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { inject, onMounted, ref } from 'vue';
    import ProjSidebar from './sidebar/ProjSidebar.vue';

    const projStore = useProjectStore()
    const projs = ref(null)
    const user = inject('user');
    const visibleLeft = ref(false);

    onMounted(async () => {
        projs.value = await projStore.getProjects(user.userId);
    })
</script>

<style scoped>
    .fixed-button {
        position: fixed;
        left: 20px;
        bottom: 20px;
        z-index: 1000;
    }

    :deep(.p-drawer-header) {
        padding: 1rem;
        background-color: var(--surface-section);
        border-bottom: 1px solid var(--surface-border);
    }

    :deep(.p-drawer-header h2) {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    :deep(.p-drawer-content) {
        padding: 0;
    }
</style>