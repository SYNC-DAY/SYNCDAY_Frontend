// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import ProjMainPage from '@/views/Proj/ProjMainPage.vue'
import ProjectView from '@/views/Proj/components/ProjectView.vue'
import WorkspaceView from '@/views/Workspace/WorkspaceView.vue'
import GithubCallback from '@/views/Proj/GithubCallback.vue' // 직접 import

export default  [
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
  },
  // GitHub 콜백 라우트를 최상위 레벨로 이동

]


