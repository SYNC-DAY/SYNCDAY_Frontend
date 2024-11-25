<template>
    <div class="layout-topbar">
        <!-- Nav - Left -->
        <div class="layout-topbar-logo-container">
            <!-- SideBar toggle -->
            <!-- <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button> -->

            <!-- Logo -->
            <RouterLink to="/" class="layout-topbar-logo">
                <span>SYNCDAY</span>
            </RouterLink>
        </div>

        <!-- tabs -->
        <div class="layout-topbar-tabs">
            <RouterLink to="/calendar" class="tab-link" :class="{ active: isRouteActive('calendar') }">
                <span>캘린더</span>
            </RouterLink>

            <RouterLink to="/team" class="tab-link" :class="{ active: isRouteActive('team') }">
                <span>팀</span>
            </RouterLink>

            <RouterLink to="/project" class="tab-link" :class="{ active: isRouteActive('project') }">
                <span>프로젝트</span>
            </RouterLink>
        </div>

        <!-- search -->
        <div>
            <InputText placeholder="Search" type="text" :model="searchInput" />
        </div>

        <!-- 아이콘, 프로필 -->
        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <!-- 라이트 모드, 다크모드 조절 -->
                <!-- <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button> -->

                <!-- 회의실 예약 -->
                <button type="button" class="layout-topbar-action">
                    <i class="pi pi-calendar"></i>
                </button>

                <!-- 디엠 -->
                <button type="button" class="layout-topbar-action">
                    <i class="pi pi-send"></i>
                </button>

                <!-- 알림 -->
                <button type="button" class="layout-topbar-action">
                    <i class="pi pi-inbox"></i>
                </button>

                <!-- <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div> -->
            </div>

            <!-- <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button> -->

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <!-- <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useLayout } from '@/layout/composables/layout';
import InputText from 'primevue/inputtext';
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';

const searchInput = ref('');

const router = useRouter();
const route = useRoute();

const currentRoute = computed(() => route.path);
const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();

const isRouteActive = (routeName) => {
    return route.path.includes(`/${routeName}`);
};
</script>
<style scoped></style>
