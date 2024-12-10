<template>
	<div class="workspace-header container-row underline-gray">
		<div class="container-row header-left">
			<h4>{{ workspaceName }}</h4>
			<Button
				icon="pi pi-code"
				text
				@click.stop="$emit('openRepoSettings')"
				v-tooltip="'Repository Settings'" />
			<Button
				icon="pi pi-sync"
				text
				@click.stop="$emit('openMilestoneSelection')"
				v-tooltip="'sync milestones'" />
		</div>

		<div class="container-row header-right">
			<Button
				icon="pi pi-cog"
				severity="secondary" />
			<Button
				icon="pi pi-tag"
				@click="$emit('openTagDialog')" />
		</div>
	</div>
</template>

<script setup>
	defineProps({
		workspaceName: {
			type: String,
			required: true,
		},
	});

	defineEmits(["openRepoSettings", "openMilestoneSelection", "openTagDialog"]);
</script>

<style scoped>
	.workspace-header {
		padding: 0 2rem;
	}

	.workspace-header h4 {
		font-size: 1.4rem;
	}

	.workspace-header > h3 {
		font-size: 2rem;
	}

	.header-right {
		gap: 0.5rem;
	}
</style>
