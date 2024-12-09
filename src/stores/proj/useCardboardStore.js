// stores/cardboardStore.js
import { defineStore } from "pinia";
// import { api } from "@/api";

export const useCardboardStore = defineStore("cardboard", {
  state: () => ({
    cardboards: {}, // Keyed by cardboard ID
    cards: {}, // Keyed by cardboard ID -> array of cards
    isLoading: false,
    error: null,
  }),

  getters: {
    getCardboard: state => id => {
      return state.cardboards[id];
    },

    getCards: state => cardboardId => {
      return state.cards[cardboardId] || [];
    },

    getCardsByStatus: state => (cardboardId, status) => {
      return (state.cards[cardboardId] || []).filter(card => card.status === status);
    },

    getCardById: state => (cardboardId, cardId) => {
      return state.cards[cardboardId]?.find(card => card.id === cardId);
    },
  },

  actions: {
    // Fetch all cardboards for a project
    async fetchProjectCardboards(projectId) {
      if (!projectId) throw new Error("Project ID is required");

      try {
        this.isLoading = true;
        // const response = await axios.get(`/cardboards/workacp/${cardboardId}`);

        const cardboards = response.data;
        cardboards.forEach(cardboard => {
          this.cardboards[cardboard.id] = cardboard;
        });

        return cardboards;
      } catch (error) {
        console.error("Error fetching cardboards:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Create a new cardboard
    async createCardboard(cardboardData) {
      if (!cardboardData.project_id) {
        throw new Error("Project ID is required");
      }

      try {
        this.isLoading = true;
        const response = await api.post(`/projects/${cardboardData.project_id}/cardboards`, cardboardData);

        const cardboard = response.data;
        this.cardboards[cardboard.id] = cardboard;
        this.cards[cardboard.id] = [];

        return cardboard.id;
      } catch (error) {
        console.error("Error creating cardboard:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Update a cardboard
    async updateCardboard(cardboardId, updates) {
      if (!cardboardId) throw new Error("Cardboard ID is required");

      try {
        this.isLoading = true;
        const response = await api.patch(`/cardboards/${cardboardId}`, updates);

        const updatedCardboard = response.data;
        this.cardboards[cardboardId] = updatedCardboard;

        return updatedCardboard;
      } catch (error) {
        console.error("Error updating cardboard:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Delete a cardboard
    async deleteCardboard(cardboardId) {
      if (!cardboardId) throw new Error("Cardboard ID is required");

      try {
        this.isLoading = true;
        // await api.delete(`/cardboards/${cardboardId}`);

        delete this.cardboards[cardboardId];
        delete this.cards[cardboardId];
      } catch (error) {
        console.error("Error deleting cardboard:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Fetch cards for a cardboard
    async fetchCards(cardboardId) {
      if (!cardboardId) throw new Error("Cardboard ID is required");

      try {
        this.isLoading = true;
        // const response = await api.get(`/cardboards/${cardboardId}/cards`);

        const cards = response.data;
        this.cards[cardboardId] = cards;

        return cards;
      } catch (error) {
        console.error("Error fetching cards:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Create a new card
    async createCard(cardData) {
      if (!cardData.cardboard_id) {
        throw new Error("Cardboard ID is required");
      }

      try {
        this.isLoading = true;
        // const response = await api.post(`/cardboards/${cardData.cardboard_id}/cards`, cardData);

        const card = response.data;
        if (!this.cards[cardData.cardboard_id]) {
          this.cards[cardData.cardboard_id] = [];
        }
        this.cards[cardData.cardboard_id].push(card);

        return card;
      } catch (error) {
        console.error("Error creating card:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Update a card
    async updateCard(cardboardId, cardId, updates) {
      if (!cardboardId || !cardId) {
        throw new Error("Cardboard ID and Card ID are required");
      }

      try {
        this.isLoading = true;
        // const response = await api.patch(`/cardboards/${cardboardId}/cards/${cardId}`, updates);

        const updatedCard = response.data;
        const cardIndex = this.cards[cardboardId].findIndex(card => card.id === cardId);

        if (cardIndex !== -1) {
          this.cards[cardboardId][cardIndex] = updatedCard;
        }

        return updatedCard;
      } catch (error) {
        console.error("Error updating card:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Delete a card
    async deleteCard(cardboardId, cardId) {
      if (!cardboardId || !cardId) {
        throw new Error("Cardboard ID and Card ID are required");
      }

      try {
        this.isLoading = true;
        // await api.delete(`/cardboards/${cardboardId}/cards/${cardId}`);

        this.cards[cardboardId] = this.cards[cardboardId].filter(card => card.id !== cardId);
      } catch (error) {
        console.error("Error deleting card:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Update card status
    async updateCardStatus(cardboardId, cardId, newStatus) {
      return this.updateCard(cardboardId, cardId, { status: newStatus });
    },

    // Update card position
    async updateCardPosition(cardboardId, cardId, newPosition) {
      return this.updateCard(cardboardId, cardId, { position: newPosition });
    },

    // Clear store state
    clearStore() {
      this.cardboards = {};
      this.cards = {};
      this.isLoading = false;
      this.error = null;
    },
  },
});
