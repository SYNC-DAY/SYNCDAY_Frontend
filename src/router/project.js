export default [
    {
        path: '/project',
        name: 'project',
        component: () => import('@/views/proj/ProjMainPage.vue'),
        children: [
            {
                path: ':projectId',
                lname: 'ProjectView',
                component: import('@/views/proj/components/ProjectView.vue')
            },
            {
                path: '/workspace/:workspaceId',
                name: 'Workspace',
                component: import('@/views/workspace/WorkspaceView.vue')
            }
        ]
    }
];
