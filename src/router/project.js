export default [
    {
        path: "/project",
        name: "Project",
        component: () => import('@/views/Proj/ProjMainPage.vue'),
        meta: { requiresAuth: true }
    }, 

    {
        path: '/workspaces/:workspaceId',
        name: 'Workspace',
        component: () => import('@/views/Workspace/WorkspaceMainPage.vue'),
        meta:{requiresAuth: true},
        props: true
    }
]