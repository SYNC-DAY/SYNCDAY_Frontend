export default [
    {
        path: '/login',
        name: 'Login',
        component: import('@/views/pages/auth/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/mypage',
        name: 'MyPage',
        component: import('@/views/user/MyPage.vue'),
        meta: { requiresAuth: true }
    }
    // {
    //     path: '/password-change',
    //     name: 'PwdChange',
    //     component: () => import('@/views/user/PassWordChange.vue'),
    //     meta: { requiresAuth: true }
    // }
];
