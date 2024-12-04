import { defineStore } from 'pinia';
import axios from 'axios';

export const useTeamStore = defineStore('teamStore', {
    state: () => ({
        teamName: "",
        teamId: 0,
        boardId: 0,
        boardTitle: '',
        postId: 0
    }),
    actions: {
    async getTeamName(userId) {
        const response = await axios.get(`/team/my?userId=${userId}`);
        this.teamName = response.data.data.teamName;
        this.teamId = response.data.data.teamId;
        },
    async updateBoardId(newBoardId) {
        this.boardId = newBoardId;
    },
    updatePostId(newPostId){
        this.postId = newPostId;
    },
    updateBoardTitle(newBoardTitle){
        this.boardTitle = newBoardTitle;
    }
},
    persist: {
        enabled: true,
        strategies: [
            {
                key: "team",
                storage: sessionStorage,
                paths: ["teamName","boardId","boardTitle","postId","teamId"]
            }
        ]
    }
});
