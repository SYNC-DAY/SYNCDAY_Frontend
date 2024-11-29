export default [
    {
        path: '/search',
        name: 'SearchResult',
        component: () => import('@/views/search/SearchResult.vue'),
        meta: { requiresAuth: true }
    }
];
