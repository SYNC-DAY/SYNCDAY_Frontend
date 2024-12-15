<template>
    <div>프로젝트</div>
    <div class="flex flex-row">
        <Drawer v-model:visible="visibleLeft" header="Projects">
            <ProjSidebar :projs="projs" />
        </Drawer>
        <div>
            <!-- <span>{{ user.userId }}</span> -->
            <RouterView />
        </div>
        <Button icon="pi pi-arrow-right" @click="visibleLeft = true" class="fixed-button" />
    </div>
</template>

<script setup>
    import { useProjectStore } from '@/stores/proj/useProjectStore';
    import { inject, onMounted, ref } from 'vue';


    /* import sidebar items */
    import ProjSidebar from './sidebar/ProjSidebar.vue';
    /* provide, inject */
    const projStore = useProjectStore()
    const projs = ref(null)
    const user = inject('user');

    /* refs */
    const visibleLeft = ref(false);

    onMounted(async () => {
        projs.value = await projStore.getProjects(user.userId);
    })

</script>

<style scoped>
    /* div {
        background-color: black;
    } */

    .fixed-button {
        position: fixed;
        left: 20px;
        /* 왼쪽에서 20px 떨어짐 */
        bottom: 20px;
        /* 아래에서 20px 떨어짐 */
        z-index: 1000;
        /* drawer보다 위에 표시되도록 z-index 설정 */
    }
</style>
