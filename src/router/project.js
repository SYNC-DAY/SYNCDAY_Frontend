export default [
    {
        path: "/project",
        name: "Project",
        component: () => import('@/views/Proj/ProjMainPage.vue'),
        meta: { requiresAuth: true }
    }
]