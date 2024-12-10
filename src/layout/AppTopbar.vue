<script setup>
    import { useLayout } from '@/layout/composables/layout';
    import AppConfigurator from './AppConfigurator.vue';

    const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

    const navigateToMyPage = () => {};
</script>

<template>
    <div class="layout-topbar container-row gap-x-4">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button>
            <router-link to="/" class="layout-topbar-logo">
                <img src="/src/assets/img/SyncDay_SVG.svg" alt="" />
                <span class="logo-text">SYNCDAY</span>
            </router-link>
        </div>

        <div class="flex justify-center gap-x-4">
            <RouterLink to="/project">Calendar</RouterLink>
            <RouterLink to="/project">Team</RouterLink>
            <RouterLink to="/project">Projects</RouterLink>
        </div>
        <div class="layout-topbar-actions">
            <IconField class="flex-1">
                <InputIcon>
                    <i class="pi pi-search" />
                </InputIcon>
                <InputText placeholder="Search" />
            </IconField>
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <div class="relative">
                    <!-- <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button> -->
                    <AppConfigurator />
                </div>
            </div>

            <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>

                    <RouterLink to="/mypage">
                        <button class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
