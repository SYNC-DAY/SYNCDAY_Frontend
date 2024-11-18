export default [
    {
        path: "/",
        name: "Home",
        component: () => import('@/views/main.vue'),
        meta: { requiresAuth: true }
    }
]