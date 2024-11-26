<template>
    <div class="root-container">
        <AppTopbar />

        <RouterView />
    </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import AppTopbar from './layout/AppTopbar.vue';
</script>
<style scoped></style>
