export default [
    {
        path: "/project",
        name: "Project",
        component: () => import('@/views/Proj/ProjMainPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path:"/workspace/:workspaceId",
        name:"Workspace",
        component: ()=> import('@/views/Proj/components/WorkspaceContent.vue'),
        props: true
    }
]