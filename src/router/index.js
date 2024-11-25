// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from "../stores/auth.js"

// 각 도메인별 라우트 import
import userRoutes from './user.js'
import projectRoutes from './project.js'
import calendarRoutes from './calendar.js'

export async function setupRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'Home',
        component: () => import('@/views/main.vue'),
        meta: { requiresAuth: true }
      },
      ...userRoutes,
      ...projectRoutes,
      ...calendarRoutes,
    ],
  })

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    console.log('라우터 가드 시작 - 이동할 경로:', to.path)
    console.log('현재 인증 상태:', authStore.isAuthenticated)

    if (!authStore.isAuthenticated) {
      await authStore.initializeAuth()
    }

    console.log('🚦 Router Navigation Start:', {
      to: {
        path: to.path,
        name: to.name,
        params: to.params,
        query: to.query
      },
      from: {
        path: from.path,
        name: from.name,
        params: from.params,
        query: from.query
      }
    });

    // 로그인 페이지인 경우
    if (to.path === '/login') {
      if (authStore.isAuthenticated) {
        // 이미 인증된 경우 메인으로
        next('/')
      } else {
        // 인증되지 않은 경우 로그인 페이지로
        next()
      }
      return
    }

    // 인증이 필요한 페이지의 경우
    if (to.meta.requiresAuth) {
      if (authStore.isAuthenticated) {
        // 이미 인증된 경우 바로 진행
        next()
      } else {
        // 인증이 필요한 경우 initializeAuth 실행
        try {
          const isAuthenticated = await authStore.initializeAuth()
          if (isAuthenticated) {
            next()
          } else {
            next({
              path: '/login',
              query: { redirect: to.fullPath }
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          next('/login')
        }
      }
      return
    }

    // 그 외의 경우
    next()
  })

  router.afterEach((to, from) => {
    console.log('✅ Router Navigation Complete:', {
      currentRoute: {
        path: to.path,
        name: to.name,
        params: to.params,
        query: to.query
      }
    });
  });
  
  router.onError((error) => {
    console.error('❌ Router Navigation Error:', {
      error: error.message,
      stack: error.stack
    });
  });

  return router
}