import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import GithubOrganization from "@/views/github/GithubOrganization.vue";
import GithubAppCallback from "@/views/github/GithubAppCallback.vue";
const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: "/",
      component: GithubOrganization,
    },
    {
      path: "/oauth/github/callback",
      component: GithubAppCallback,
    },
    {
      path: "/github/install",
      name: "GithubInstall",
      component: () => import("@/views/github/GithubInstall.vue"),
    },
  ],
});
router.beforeEach((to, from, next) => {
  console.log("Route change:", to.fullPath);
  next();
});
export default router;

const routes = [];
