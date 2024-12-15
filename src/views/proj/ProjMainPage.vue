<template>
    <div>프로젝트</div>
    <div class="flex flex-row">
        <Drawer v-model:visible="visibleLeft" position="left">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        </Drawer>

        <Button icon="pi pi-arrow-right" @click="visibleLeft = true" />
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    const visibleLeft = ref(false);
</script>

<style scoped>
    /* div {
        background-color: black;
    } */
</style>
