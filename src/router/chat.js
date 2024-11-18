export default [
    {
        path: "/chatlist",
        name: 'ChatList',
        component: () => import('@/views/chat/ChatList.vue'),
        meta: { requiresAuth: false }
    },

]