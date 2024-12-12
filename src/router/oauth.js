import GithubAppCallback from "@/views/vcs/github/GithubAppCallback.vue";

const routes = [
	{
		path: "/api/oauth/github/callback",
		component: GithubAppCallback,
	},
];
export default routes;
