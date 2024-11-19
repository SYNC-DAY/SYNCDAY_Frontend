import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from "../stores/auth.js"

// 각 도메인별 라우트 import
import userRoutes from './user'
import mainRoutes from './main'
import calendarRoutes from './calendar'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...mainRoutes,
    ...userRoutes,{
      path:'/',
      redirect:''
    },
    ...calendarRoutes,
  ],
})
// router/index.js
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 이미 인증된 상태에서 로그인 페이지 접근 시
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }

  try {
    // 인증이 필요한 페이지이고 초기화가 안 된 경우
    if (to.meta.requiresAuth) {
      const isAuthenticated = await authStore.initializeAuth()

      if (!isAuthenticated) {
        // 현재 시도하려던 페이지 정보를 저장
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
      // 인증 성공 후 원래 가려던 페이지로 이동
      if (isAuthenticated && to.path === '/login' && to.query.redirect) {
        next(to.query.redirect)
        return
      }
    }

    next()
  } catch (error) {
    console.error('Auth check failed:', error)
    next('/login')
  }
})
export default router
