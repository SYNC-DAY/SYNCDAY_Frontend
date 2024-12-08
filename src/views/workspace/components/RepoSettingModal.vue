<template>
	<Dialog v-model:visible="isVisible" modal header="Repository Settings" :style="{ width: '50vw' }" :closable="true">

		<!-- Confirmation Dialog -->
		<Dialog v-model:visible="showDeleteConfirm" modal header="Confirm Deletion" :style="{ width: '350px' }">
			<div class="confirmation-content">
				<i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
				<span>Are you sure you want to remove {{ selectedRepo?.name }}?</span>
			</div>
			<InputText />
			<div v-for="repo in repositories" key="repo.id">
				<input type="checkbox" v-model="importClosedIssues" class="sr-only peer" />
				<span>{{ repo }}</span>
			</div>
			<template #footer>
				<Button label="No" icon="pi pi-times" @click="showDeleteConfirm = false" class="p-button-text" />
				<Button label="Yes" icon="pi pi-check" @click="deleteRepository" class="p-button-danger" />
			</template>
		</Dialog>
	</Dialog>
</template>

<script setup>
	import { ref, onMounted, watch } from 'vue';
	import { useToast } from 'primevue/usetoast';

	const props = defineProps({
		projectId: {
			type: [String, Number],
			required: true
		},
		workspaceId: {
			type: [String, Number],
			required: true
		},
		modelValue: {
			type: Boolean,
			default: false
		},
		githubInstallationId: {
			type: Number,
			required: false
		}
	});

	const emit = defineEmits(['update:modelValue']);

	const toast = useToast();
	const repositories = ref([]);
	const isVisible = ref(props.modelValue);
	const newRepoUrl = ref('');
	const isAddingRepo = ref(false);
	const syncingRepos = ref([]);
	const showDeleteConfirm = ref(false);
	const selectedRepo = ref(null);

	// Watch for modal visibility changes
	watch(() => props.modelValue, (newValue) => {
		isVisible.value = newValue;
	});

	watch(() => isVisible.value, (newValue) => {
		emit('update:modelValue', newValue);
	});

	// Load repositories on mount
	onMounted(async () => {
		await fetchRepositories();
	});

	const fetchRepositories = async () => {
		try {
			console.log(props.githubInstallationId)
			// Replace with your actual API call
			const response = await fetch(`/api/github/repositories/installations/${props.githubInstallationId}`);
			const data = await response.json();
			console.log(data);
			repositories.value = data;
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to load repositories',
				life: 3000
			});
		}
	};

	const addRepository = async () => {
		if (!newRepoUrl.value) {
			toast.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Please enter a repository URL',
				life: 3000
			});
			return;
		}

		isAddingRepo.value = true;
		try {
			// Replace with your actual API call
			await fetch(`/api/workspaces/${props.workspaceId}/projects/${props.projectId}/repositories`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ url: newRepoUrl.value })
			});

			await fetchRepositories();
			newRepoUrl.value = '';

			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Repository added successfully',
				life: 3000
			});
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to add repository',
				life: 3000
			});
		} finally {
			isAddingRepo.value = false;
		}
	};

	const syncRepository = async (repoId) => {
		syncingRepos.value.push(repoId);
		try {
			// Replace with your actual API call
			await fetch(`/api/repositories/${repoId}/sync`, { method: 'POST' });

			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Repository synced successfully',
				life: 3000
			});

			await fetchRepositories();
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to sync repository',
				life: 3000
			});
		} finally {
			syncingRepos.value = syncingRepos.value.filter(id => id !== repoId);
		}
	};

	const confirmDeleteRepo = (repo) => {
		selectedRepo.value = repo;
		showDeleteConfirm.value = true;
	};

	const deleteRepository = async () => {
		try {
			// Replace with your actual API call
			await fetch(`/api/repositories/${selectedRepo.value.id}`, {
				method: 'DELETE'
			});

			showDeleteConfirm.value = false;
			await fetchRepositories();

			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Repository removed successfully',
				life: 3000
			});
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to remove repository',
				life: 3000
			});
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleString();
	};
</script>

<style lang="scss" scoped>
	.repo-settings {
		.repo-list {
			margin-bottom: 2rem;
		}

		.confirmation-content {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 1rem;
		}
	}
</style>