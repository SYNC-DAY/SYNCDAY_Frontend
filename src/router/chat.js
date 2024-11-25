export default [
    {
        path: '/chat',
        name: 'ChatList',
        component: () => import('@/views/chat/ChatList.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/chat/:roomId',
        name: 'ChatRoom',
        component: () => import('@/views/chat/ChatRoom.vue'),
        props: true,
        meta: { requiresAuth: true }
    }
]