<template>

    <Drawer v-model:visible="visibleLeft" :closeOnEscape="false" position="left" class="w-full" id="proj-sidebar">
        <template #header>
            <h2>Projects</h2>
        </template>
        <ProjSidebar :projs="projs" />
    </Drawer>




    <Button icon="pi pi-bars" @click="visibleLeft = true" severity="secondary" class="fixed-button p-button-rounded" />

    <RouterView />



</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { inject, onMounted, ref } from 'vue';
    import ProjSidebar from './components/ProjSidebar.vue';

    const projStore = useProjectStore();
    const projs = ref(null);
    const user = inject('user');
    const visibleLeft = ref(false);

    onMounted(async () => {
        projs.value = await projStore.getProjects(user.userId);
    });
</script>
<style>
    .fixed-button {
        position: fixed !important;
        left: 20px !important;
        bottom: 20px !important;
        z-index: 1000;
    }

    .p-drawer-left .p-drawer-content,
    .p-drawer-right .p-drawer-content,
    .p-drawer-top .p-drawer-content,
    .p-drawer-bottom .p-drawer-content {
        padding: 0 !important;
    }



    .p-drawer-header {
        padding: 1rem;
        background-color: var(--surface-section);
        border-bottom: 1px solid var(--surface-border);
    }

    .p-drawer-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }
</style>