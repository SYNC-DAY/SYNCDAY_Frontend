<template>
    <Card style="overflow: hidden" class="flex flex-row p-3">
        <template #header>
            <div class="flex flex-row items-center gap-8">
                <img :src="authStore.user.profilePhoto" alt="#" class="w-40 h-40 rounded-full object-cover" />

                <div class="flex flex-col ml-4">
                    <strong class="text-lg mb-1">{{ authStore.user.userName }}</strong>
                    <span class="text-gray-600">{{ authStore.user.email }}</span>

                    <div>
                        <span>개발 1팀</span>
                        <span> # 84</span>
                    </div>
                </div>
            </div>
        </template>
        <template #content>
            <div class="flex flex-row justify-right">
                <Button label="비밀번호 수정" icon="pi" severity="secondary" @click="navigateToChangePasswordPage"></Button>
            </div>
        </template>
    </Card>
</template>

<script setup>
    import { useAuthStore } from '@/stores/auth.js';
    import { onMounted, ref } from 'vue';
    import { useRouter } from 'vue-router';

    // PrimeVue Components
    import axios from 'axios';
    const router = useRouter();
    const authStore = useAuthStore();
    const userInfo = ref({});

    const goToPasswordChange = () => {
        router.push('/password-change');
    };

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('/user/profile');
            userInfo.value = response.data.data;
        } catch (error) {
            console.error('유저정보 fetch 실패', error);
        }
    };

    onMounted(() => {
        fetchUserInfo();
    });
</script>

<style lang="scss" scoped>
    .profile-page {
        max-width: 80rem;
        margin: 0 auto;
        padding: 2rem;

        .my-page-title {
            font-size: 2rem;
            color: var(--surface-900);
            margin-bottom: 2rem;
        }

        .profile-card {
            background: var(--surface-card);
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: var(--card-shadow);

            .gradient-banner {
                height: 15rem;
                background: linear-gradient(to right, var(--primary-100), var(--primary-200));
            }
        }

        .profile-content {
            position: relative;
            margin-top: -5rem;
            padding: 0 2rem;
            display: flex;
            gap: 2rem;
        }

        .left-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;

            .profile-photo {
                width: 10rem;
                height: 10rem;
                border: 4px solid var(--surface-card);
            }

            .username {
                margin: 1rem 0;
                color: var(--surface-900);
            }

            .role {
                font-size: 1.1rem;
            }
        }

        .right-section {
            flex: 2;
            padding: 1rem;

            .github-panel {
                :deep(.p-panel-header) {
                    background: var(--surface-ground);
                }
            }
        }

        .role-tag {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;

            .job-title {
                background: var(--surface-ground);
                color: var(--surface-900);
            }
        }
    }

    // Responsive Design
    @media screen and (max-width: 768px) {
        .profile-content {
            flex-direction: column;
        }

        .right-section,
        .role-tag {
            width: 100%;
        }
    }
</style>
