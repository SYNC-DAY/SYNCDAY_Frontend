export default [
    {
        path: '/calendar',
        component: () => import('@/views/calendar/CalendarRoot.vue'),
        redirect: {path:"/calendar/view"},        // 이 부분 나중에 바꾸기!!!!!
        children: [
            {
                path: 'view/:userId',
                component: () => import('@/views/calendar/CalendarView.vue'),
            },
            // {
            //     path: 'view/:musicalId/:reviewId',  // :id는 동적 라우트 매개변수
            //     name: 'ReviewDetailView',
            //     component: () => import('@/views/review/ReviewDetailView.vue')    
            // },
            // {
            //     path: 'create',  
            //     name: 'BoardCreate',
            //     component: () => import('@/views/board/BoardCreate.vue')    
            // },
            // {
            //     path: 'view/no-args',  
            //     name: 'BoardNoArgs',
            //     component: () => import('@/views/board/BoardNoArgs.vue')    
            // },
            // {
            //     path: 'edit/:id',  
            //     name: 'BoardUpdate',
            //     component: () => import('@/views/board/BoardUpdate.vue')    
            // }
        ],
    },
];