import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: 'Login',
      component: () => import('@/views/user/LoginPage.vue'),
      meta: { requiresAuth: false } // login page는 인증 필요 x
    },
    {
      path: "/",
      name: "Home",
      component: () => import('@/views/main.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: "/mypage",
      name: "MyPage",
      component: () => import('@/views/user/Mypage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: "/password-change",
      name: "PwdChange",
      component: () => import('@/views/user/PassWordChange.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'ChatList',
      component: () => import('@/views/chat/ChatList.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (authStore.isAuthenticated && to.path === '/login') {
    next({ path: '/' })  // 이미 로그인된 상태에서 로그인 페이지 접근 시 메인으로
  } else {
    next()
  }
})

export default router
