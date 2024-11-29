// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

// 각 도메인별 라우트 import
import calendarRoutes from "./calendar.js";
import meetingroomRoutes from "./meetingroom.js";
import projectRoutes from "./project.js";
import userRoutes from "./user.js";

export async function setupRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: "/",
        name: "Home",
        component: () => import("@/views/user/Main.vue"),
        meta: { requiresAuth: true },
      },
      ...userRoutes,
      ...projectRoutes,
      ...calendarRoutes,
      ...meetingroomRoutes,
    ],
  });
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // 로그인 페이지로의 이동 처리
    if (to.path === "/login") {
      // 이미 인증된 사용자는 메인 페이지로
      if (authStore.isAuthenticated) {
        next("/");
        return;
      }
      // 인증되지 않은 사용자는 로그인 페이지로
      next();
      return;
    }

    // 인증이 필요한 페이지 접근 처리
    if (to.meta.requiresAuth) {
      if (!authStore.isAuthenticated) {
        // 인증되지 않은 경우 로그인 페이지로 리다이렉트
        next({
          path: "/login",
          query: { redirect: to.fullPath },
        });
        return;
      }
    }

    // 그 외의 경우는 정상적으로 라우팅
    next();
  });

  return router;
}