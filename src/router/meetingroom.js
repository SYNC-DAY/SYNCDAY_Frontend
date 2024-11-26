export default [
    {
        path: "/meetingroom",
        name: "Meetingroom",
        component: () => import('@/views/Meetingroom/Meetingroom.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: "/meetingroom/reservation",
        name: "MeetingroomReservation",
        component: () => import('@/views/Meetingroom/MeetingroomReservation.vue'),
        meta: { requiresAuth: true } // 인증이 필요한 경우 설정
    }
]