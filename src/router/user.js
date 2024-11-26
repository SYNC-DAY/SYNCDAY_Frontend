export default [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/user/LoginPage.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/mypage',
        name: 'MyPage',
        component: () => import('@/views/user/Mypage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/password-change',
        name: 'PwdChange',
        component: () => import('@/views/user/PassWordChange.vue'),
        meta: { requiresAuth: true }
    }
];
