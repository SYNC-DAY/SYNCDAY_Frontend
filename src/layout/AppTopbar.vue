<script setup>
    import { useLayout } from '@/layout/composables/layout';
    import AppConfigurator from './AppConfigurator.vue';

    const { toggleMenu, toggleDarkMode, isDarkTheme } = useLayout();

    const navigateToMyPage = () => {};
</script>

<template>
    <div class="layout-topbar gap-x-4">
        <div class="layout-topbar-logo-container">
            <!-- <button class="layout-menu-button layout-topbar-action" @click="toggleMenu">
                <i class="pi pi-bars"></i>
            </button> -->
            <router-link to="/" class="layout-topbar-logo">
                <img src="/src/assets/img/SyncDay_SVG.svg" alt="" />
                <span class="logo-text">SYNCDAY</span>
            </router-link>
        </div>

        <div class="layout-topbar-tabs">
            <RouterLink to="/calendar">캘린더</RouterLink>
            <RouterLink to="/team">팀</RouterLink>
            <RouterLink to="/project">프로젝트</RouterLink>
        </div>

        <div class="layout-topbar-search">
            <IconField class="flex flex-1">
                <InputIcon>
                    <i class="pi pi-search" />
                </InputIcon>
                <InputText placeholder="Search" />
            </IconField>
        </div>
        <div class="layout-topbar-actions">
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
                        <i class="pi pi-users"></i>
                        <span>회의실 예약 </span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-send"></i>
                        <span>메시지</span>
                    </button>

                    <RouterLink to="/mypage">
                        <button class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>프로필</span>
                        </button>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>
