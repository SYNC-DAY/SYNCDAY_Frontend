import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import GithubOrganization from "@/views/github/GithubOrganization.vue";
import GithubAppCallback from "@/views/github/GithubAppCallback.vue";
const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: "/",
      component: GithubOrganization,
    },
    {
      path: "/github/callback",
      component: GithubAppCallback,
    },
    {
      path: "/github/install",
      name: "GithubInstall",
      component: () => import("@/views/github/GithubInstall.vue"),
    },
  ],
});

export default router;

const routes = [];
