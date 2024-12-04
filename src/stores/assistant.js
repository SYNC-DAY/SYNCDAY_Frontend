// src/stores/assistantStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAssistantStore = defineStore('assistantStore', {
    state: () => ({
        isFirst: true,
        todaySchedules: [],
        notiedSchedules: [],
    }),
    actions: {
        initialize(userId) {
            this.isFirst = false;
            this.notiedSchedules.length = 0;
            this.getTodaySchedule(userId);
        },
        async getTodaySchedule(userId) {
            try {
                const response = await axios.get(`/schedule/my/today?userId=${userId}`);
                this.todaySchedules.length = 0;
                this.todaySchedules.push(...response.data.data);
            } catch (error) {
                console.error("Error fetching schedules:", error);
            }
        },
        getNotiedSchedule(schedule) {
            this.notiedSchedules.push(schedule);
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: "assistant",
                storage: sessionStorage,
                paths: ['isFirst', 'todaySchedules', 'notiedSchedules']
            }
        ]
    }
});
