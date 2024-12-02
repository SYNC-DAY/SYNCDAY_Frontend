const routes = [
  {
    path: "/github/callback",
    name: "GithubCallback",
    component: () => import("@/views/vcs/github/GithubCallback.vue"),
  },
];
export default routes;
