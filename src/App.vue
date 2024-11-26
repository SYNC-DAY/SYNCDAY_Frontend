<template>
    <div class="root-container">
        <AppTopbar />

        <div class="main-content"></div>
        <RouterView />
    </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import AppTopbar from './layout/AppTopbar.vue';
</script>

<style scoped>
.root-container {
    display: flex;
    flex-direction: column;
}
.main-content {
    margin-top: 8vh;
}
</style>
