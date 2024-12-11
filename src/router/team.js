export default [
    {
        path: '/team',
        component: () => import('@/views/team/TeamRoot.vue'),
        redirect: { path: '/team/board/view' },
        meta: { requiresAuth: true },
        children: [
            {
                path: 'board/view',
                component: () => import('@/views/team/TeamBoardView.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'post/view',
                component: () => import('@/views/team/TeamPostView.vue'),
                meta: { requiresAuth: true }
            }
            // {
            //     path: 'post/detail/view',
            //     name: 'PostDetail',
            //     component: () => import('@/views/team/TeamPostDetailView.vue'),
            //     meta: { requiresAuth: true }
            // },
            // {
            //     path: 'post/create',
            //     name: 'PostCreate',
            //     component: () => import('@/views/team/TeamPostCreate.vue'),
            //     meta: { requiresAuth: true }
            // },
            // {
            //     path: 'board/edit',
            //     name: 'BoardEdit',
            //     component: () => import('@/views/team/TeamBoardEdit.vue'),
            //     meta: { requiresAuth: true }
            // },
        ]
    }
];
