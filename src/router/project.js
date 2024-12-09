// router/index.js
import ProjMainPage from "@/views/proj/ProjMainPage.vue";
import ProjectView from "@/views/proj/ProjectView.vue";
import WorkspaceView from "@/views/workspace/WorkspaceView.vue";

const routes = [
	{
		path: "/project",
		component: ProjMainPage,
		name: "Projects",
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
				props: route => ({
					...route.params,
					cardId: route.query.cardId, // 쿼리 파라미터로 cardId 전달
				}),
			},
		],
	},
];

export default routes;
