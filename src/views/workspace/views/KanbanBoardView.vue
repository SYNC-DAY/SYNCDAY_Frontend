<template>
	<div class="kanban-container container-row">
		<div class="kanban-column">
			<strong>To Do</strong>
			<Card>
				<template #content>
					<CardItem v-for="card in organizedCards.todo" :key="card.card_id" :card="card" />
				</template>
			</Card>
		</div>

		<div class="kanban-column">
			<strong>In Progress</strong>
			<Card>
				<template>
					<CardItem v-for="card in organizedCards.inProgress" :key="card.card_id" :card="card" />
				</template>
			</Card>
		</div>


		<div class="kanban-column">
			<strong>Done</strong>
			<Card>
				<template #content>
					<CardItem v-for="card in organizedCards.done" :key="card.card_id" :card="card" />
				</template>
			</Card>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CardItem from '../components/CardItem.vue';
const props = defineProps({
	cardboards: {
		type: Array,
		required: true
	}
});

// Computed property to organize cards by status
const organizedCards = computed(() => {
	const organized = {
		todo: [],
		inProgress: [],
		done: []
	};

	props.cardboards.forEach(board => {
		board.cards.forEach(card => {
			// You can implement your own logic to determine card status
			// For now, all cards go to todo
			organized.todo.push(card);
		});
	});

	return organized;
});
</script>

<style scoped>
.kanban-container {
	margin-top: 1rem;
	align-items: start;
	gap: 1.5rem;
}

.kanban-background {
	margin-top: 1rem;
}

.kanban-column {
	display: flex;
	flex-direction: column;
	flex: 1;
}


.card {
	background: white;
	border-radius: 8px;
	margin-bottom: 12px;
	display: flex;
	overflow: hidden;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-tag {
	width: 4px;
	height: auto;
}

.card-content {
	flex: 1;
	padding: 12px;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.card-title {
	font-size: 0.8rem;
	color: #333;
}

.assignee-avatar {
	width: 1.5rem;
	height: 1.5rem;
	border-radius: 50%;
	object-fit: cover;
}

/* Scrollbar styling */
.column-content::-webkit-scrollbar {
	width: 6px;
}

.column-content::-webkit-scrollbar-track {
	background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
	background: var(--p-primary-100);
	border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
	background: var(--p-primary-100);
}
</style>