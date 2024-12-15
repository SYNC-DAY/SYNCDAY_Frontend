<template>
    <div>프로젝트</div>
    <div class="flex flex-row">
        <Drawer v-model:visible="visibleLeft" header="Projects">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </Drawer>
        <div>
            {{ user.userId }}
        </div>
        <Button icon="pi pi-arrow-right" @click="visibleLeft = true" class="fixed-button" />
    </div>
</template>

<script setup>
    import { inject, ref } from 'vue';
    const user = inject('user');
    const visibleLeft = ref(false);
</script>

<style scoped>
    /* div {
        background-color: black;
    } */

    .fixed-button {
        position: fixed;
        left: 20px; /* 왼쪽에서 20px 떨어짐 */
        bottom: 20px; /* 아래에서 20px 떨어짐 */
        z-index: 1000; /* drawer보다 위에 표시되도록 z-index 설정 */
    }
</style>
