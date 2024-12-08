<template>
	<div class="milestone-selector">
		<div v-if="store.loading" class="loading">
			Loading milestones...
		</div>

		<div v-else-if="store.error" class="error">
			{{ store.error }}
			<button @click="store.fetchMilestones">Retry</button>
		</div>

		<div v-else class="milestone-list">
			<h2>Select a Milestone</h2>
			<div v-for="milestone in store.milestones" :key="milestone.id" class="milestone-item">
				<div class="milestone-info">
					<h3>{{ milestone.title }}</h3>
					<p>{{ milestone.description }}</p>
					<div class="milestone-meta">
						<span>Due: {{ formatDate(milestone.due_date) }}</span>
						<span>Open Issues: {{ milestone.open_issues }}</span>
					</div>
				</div>
				<button @click="selectMilestone(milestone.id)" :disabled="store.loading">
					Select
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { onMounted } from 'vue';
	import { useMilestoneStore } from './stores/MilestoneStore';

	const store = useMilestoneStore();

	onMounted(() => {
		store.fetchMilestones();
	});

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString();
	};

	const selectMilestone = async (milestoneId) => {
		await store.saveMilestone(milestoneId);
	};
</script>

<style scoped>
	.milestone-selector {
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
	}

	.milestone-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.milestone-item {
		border: 1px solid #ddd;
		padding: 15px;
		border-radius: 8px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.milestone-info {
		flex: 1;
	}

	.milestone-meta {
		display: flex;
		gap: 20px;
		color: #666;
		font-size: 0.9em;
	}

	.loading,
	.error {
		text-align: center;
		padding: 20px;
	}

	button {
		padding: 8px 16px;
		background-color: #4CAF50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}
</style>