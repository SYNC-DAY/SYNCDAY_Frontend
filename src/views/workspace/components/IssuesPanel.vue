<template>
	<div class="border rounded-lg p-4">
		<h3 class="font-medium mb-4">Milestone Issues</h3>

		<div
			v-if="isLoading"
			class="flex justify-center p-4">
			<ProgressSpinner />
		</div>

		<div
			v-else-if="!selectedMilestone"
			class="text-center p-4 text-gray-500">
			Select a milestone to view issues
		</div>

		<div
			v-else-if="!issues.length"
			class="text-center p-4 text-gray-500">
			No issues found in this milestone
		</div>

		<div
			v-else
			class="space-y-2">
			<div
				v-for="issue in issues"
				:key="issue.id"
				class="p-3 rounded-lg border">
				<div class="flex items-center gap-2">
					<i :class="['pi', issue.state === 'closed' ? 'pi-check-circle text-green-500' : 'pi-exclamation-circle text-yellow-500']" />
					<span>{{ issue.title }}</span>
				</div>
				<div
					v-if="issue.assignees?.length"
					class="text-sm text-gray-500 mt-1">
					Assigned to: {{ formatAssignees(issue.assignees) }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { defineProps } from "vue";

	defineProps({
		issues: {
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

	const formatAssignees = assignees => {
		return assignees.map(a => a.login).join(", ");
	};
</script>
