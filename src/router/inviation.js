export default [
    {
        path: '/invitation',
        component: () => import('@/views/invitation/InvitationRoot.vue'),
        redirect: { path: '/invitation/view' },
        meta: { requiresAuth: true },
        children: [
            {
                path: 'view',
                component: () => import('@/views/invitation/InvitationView.vue'),
                meta: { requiresAuth: true }
            },
            {
                path: 'mail-link',
                component: () => import('@/views/invitation/InvitationAccept.vue'),
                meta: { requiresAuth: true }
            }
        ]
    }
];
