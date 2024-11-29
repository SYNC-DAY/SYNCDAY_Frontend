export default [
    {
        path: '/meetingroom',
        name: 'Meetingroom',
        component: () => import('@/views/meetingroom/Meetingroom.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/meetingroom/reservation',
        name: 'MeetingroomReservation',
        component: () => import('@/views/meetingroom/MeetingroomReservation.vue'),
        meta: { requiresAuth: true } // 인증이 필요한 경우 설정
    }
];
