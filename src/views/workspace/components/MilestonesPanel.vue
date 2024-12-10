<template>
	<div class="border rounded-lg p-4">
		<h3 class="font-medium mb-4">Milestones</h3>

		<div
			v-if="isLoading"
			class="flex justify-center p-4">
			<ProgressSpinner />
		</div>

		<div
			v-else-if="!milestones.length"
			class="text-center p-4 text-gray-500">
			No milestones found
		</div>

		<div
			v-else
			class="space-y-2">
			<div
				v-for="milestone in milestones"
				:key="milestone.id"
				@click="$emit('select', milestone)"
				:class="['p-3 rounded-lg cursor-pointer hover:bg-gray-100', selectedMilestone?.id === milestone.id ? 'bg-gray-100' : '']">
				<div class="flex items-center justify-between">
					<h4 class="font-medium">{{ milestone.title }}</h4>
					<div
						v-if="milestone.due_on"
						class="flex items-center text-sm text-gray-500">
						<i class="pi pi-calendar mr-1" />
						{{ formatDate(milestone.due_on) }}
					</div>
				</div>
				<ProgressBar
					:value="milestone.progress_percentage"
					class="mt-2" />
				<div class="text-sm text-gray-500 mt-1">{{ milestone.open_issues }} open / {{ milestone.total_issues }} total issues</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { defineProps, defineEmits } from "vue";

	defineProps({
		milestones: {
			type: Array,
			default: () => [],
		},
		selectedMilestone: {
			type: Object,
			default: null,
		},
		isLoading: {
			type: Boolean,
			default: false,
		},
	});

	defineEmits(["select"]);

	const formatDate = dateString => {
		return new Date(dateString).toLocaleDateString();
	};
</script>
