export default [
    {
        path: "/schedule-repeat",
        redirect:"schedule-repeat/view",
        name: "ScheduleRepeat",
        component: () => import('@/views/schedule-repeat/ScheduleRepeat.vue'),
        meta: { requiresAuth: true },
        children:[{
            path:"view",
            name:"ScheduleRepeatView",
            meta: { requiresAuth: true },
            component: () => import('@/views/schedule-repeat/ScheduleRepeatView.vue')
        },
        {
            path:"invitation",
            name:"ScheduleRepeatInvitation",
            meta: {requiresAuth: true},
            component: () => import('@/views/schedule-repeat/ScheduleRepeatInvitation.vue')
        }
    ]
    }
]