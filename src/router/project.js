export default [
    {
        path: "/project",
        name: "Project",
        component: () => import('@/views/Project/ProjectPage.vue'),
        meta: { requiresAuth: true }
    }
]