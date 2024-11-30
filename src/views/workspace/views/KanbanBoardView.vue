<template>
	<div class="kanban-container width-100">
		<div class="kanban-columns container-row">
			<!-- To Do Column -->
			<div class="kanban-column container-col">
				<div class="column-header">To Do</div>
				<div class="column-content">
					<template v-for="board in cardboards" :key="board.cardboard_id">
						<template v-for="card in board.cards" :key="card.card_id">
							<div class="card">
								<div class="card-tag" :style="{ backgroundColor: card.tag_color }"></div>
								<div class="card-content">
									<div class="card-title">{{ card.card_title }}</div>
									<div class="card-assignee">
										<img :src="card.assignee_profile_url" :alt="card.assignee_name"
											class="assignee-avatar" />
									</div>
								</div>
							</div>
						</template>
					</template>
				</div>
			</div>

			<!-- In Progress Column -->
			<div class="kanban-column">
				<div class="column-header">In Progress</div>
				<div class="column-content">
					<!-- Cards will be dynamically added here -->
				</div>
			</div>

			<!-- Done Column -->
			<div class="kanban-column">
				<div class="column-header">Done</div>
				<div class="column-content">
					<!-- Cards will be dynamically added here -->
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue';

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
	gap: 3rem;
}

.kanban-columns {
	gap: 1rem
}

.kanban-column {
	flex: 1;
	background-color: var(--p-primary-100);
	/* Light pink background from your design */
	border-radius: 1rem;
	padding: 1rem;

}

.column-header {
	font-size: 1rem;
	font-weight: bold;
	margin-bottom: 16px;

}

.column-content {
	height: calc(100% - 40px);
	overflow-y: auto;
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
	background: #ffa5b5;
	border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
	background: #ff7b93;
}
</style>