// router/index.js
import ProjMainPage from "@/views/proj/ProjMainPage.vue";
import ProjectView from "@/views/proj/components/ProjectView.vue";
import WorkspaceView from "@/views/workspace/WorkspaceView.vue";

const routes = [
  {
    path: "/project",
    component: ProjMainPage,
    children: [
      {
        path: ":projectId",
        name: "Project",
        component: ProjectView,
        props: true,
      },
      {
        path: ":projectId/workspace/:workspaceId",
        name: "Workspace",
        component: WorkspaceView,
        props: true,
      },
    ],
  },
  // In your router configuration
  {
    path: "/github/projects",
    name: "GithubProjects",
    component: () => import("@/views/vcs/github/GithubProject.vue"),
    meta: { requiresAuth: true },
  },
];

export default routes;
