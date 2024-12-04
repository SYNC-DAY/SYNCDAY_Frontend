<template>
	<div class="kanban-container container-row">
		<div class="kanban-column">
			<strong>To Do</strong>
			<Card class="kanban-background container-col">
				<template #content>
					<div v-for="card in organizedCards.todo" :key="card.card_id" class="card-wrapper">
						<div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
						<CardItem :card="card" />
					</div>
					<div class="container-row justify-center">
						<Button icon="pi pi-plus" rounded severity="secondary"></Button>
					</div>
				</template>
			</Card>
		</div>

		<div class="kanban-column">
			<strong>In Progress</strong>
			<Card>
				<template #content>
					<div v-for="card in organizedCards.inProgress" :key="card.card_id" class="card-wrapper">
						<div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
						<CardItem :card="card" />
					</div>
					<div class="container-row justify-center">
						<Button icon="pi pi-plus" rounded severity="secondary"></Button>
					</div>
				</template>
			</Card>
		</div>

		<div class="kanban-column">
			<strong>Done</strong>
			<Card>
				<template #content>
					<div v-for="card in organizedCards.done" :key="card.card_id" class="card-wrapper">
						<div class="tag-indicator" :style="{ backgroundColor: card.tag_color }"></div>
						<CardItem :card="card" />
					</div>
					<div class="container-row justify-center">
						<Button icon="pi pi-plus" rounded severity="secondary"></Button>
					</div>
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
		required: true,
		default: () => []
	}
});

// Computed property to organize cards by status
const organizedCards = computed(() => {
	const organized = {
		todo: [],
		inProgress: [],
		done: []
	};

	// props.cardboards.forEach(board => {
	// 	board.cards.forEach(card => {
	// 		// You can implement your own logic to determine card status
	// 		// For now, all cards go to todo
	// 		organized.todo.push(card);
	// 	});
	// });

	props.cardboards?.forEach(board => {
	// board.cards가 undefined 또는 null이면 빈 배열로 대체
	(board.cards || []).forEach(card => {
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

.kanban-background {}

.kanban-column {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.card-wrapper {
	position: relative;
	margin-bottom: 1rem;
}


.tag-indicator {
	width: 1rem;
	height: auto;
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	border-top-left-radius: 4px;
	border-bottom-left-radius: 4px;
}
</style>