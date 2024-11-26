// router/index.js
import ProjMainPage from '@/views/Proj/ProjMainPage.vue';
import ProjectView from '@/views/Proj/components/ProjectView.vue';
import WorkspaceView from '@/views/Workspace/WorkspaceView.vue';

const routes = [
    {
        path: '/project',
        component: ProjMainPage,
        children: [
            {
                path: ':projectId',
                name: 'Project',
                component: ProjectView,
                props: true
            },
            {
                path: ':projectId/workspace/:workspaceId',
                name: 'Workspace',
                component: WorkspaceView,
                props: true
            }
        ]
    }
];

export default routes;
