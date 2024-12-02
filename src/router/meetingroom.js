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
    },
    {
        path: "/reservation_reservation/:id",
        name: "ReservationDetails",
        component: () => import('@/views/meetingroom/MeetingroomDetails.vue'), // 동적 import로 ReservationDetails를 추가
        props: true, // URL 파라미터를 컴포넌트의 props로 전달
    },
];
