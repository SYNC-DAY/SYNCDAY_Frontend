import { useProjectStore } from '@/stores/proj/useProjectStore';

export default [
    {
        path: '/project',
        name: 'Proj',
        component: () => import('@/views/proj/ProjMainPage.vue'),
        children: [
            {
                path: ':projectId',
                lname: 'ProjectView',
                component: () => import('@/views/proj/components/ProjectView.vue'),
                beforeEnter: async (to, from, next) => {
                    const projectStore = useProjectStore();
                    const projectId = to.params.projectId;

                    try {
                        if (!projectStore.projects[projectId]) {
                            // await projectStore.fetchProject(projectId);
                        }
                        next();
                    } catch (error) {}
                }
            },
            {
                path: ':projectId/workspace/:workspaceId',
                name: 'Workspace',
                component: () => import('@/views/workspace/WorkspaceView.vue')
            }
        ]
    }
];
