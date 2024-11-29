<template>
	<div class="kanban-container">
		<div class="kanban-columns">
			<!-- To Do Column -->
			<div class="kanban-column">
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
	width: 100%;
	height: 100%;
	padding: 20px;
	background-color: #fff;
}

.kanban-columns {
	display: flex;
	gap: 20px;
	height: 100%;
}

.kanban-column {
	flex: 1;
	background-color: #FFE4E9;
	/* Light pink background from your design */
	border-radius: 16px;
	padding: 16px;
	min-width: 300px;
}

.column-header {
	font-size: 20px;
	font-weight: bold;
	margin-bottom: 16px;
	color: #333;
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
	font-size: 14px;
	color: #333;
}

.assignee-avatar {
	width: 24px;
	height: 24px;
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