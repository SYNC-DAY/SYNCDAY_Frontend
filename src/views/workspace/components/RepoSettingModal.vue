<template>
	<Dialog v-model:visible="isVisible" modal header="Set GitHub Repository" :style="{ width: '50vw' }"
		:closable="true">
		<!-- Repository Selection Section -->
		<div class="container-col gap-1rem">
			<strong class="text-lg font-medium mb-4">Select repositories to import</strong>
			<InputText v-model="searchQuery" placeholder="Filter repositories" class="w-full mb-4" />

			<div class="repositories-list">
				<div v-for="(repo, id) in repositories" :key="id" class="repo-item p-3 border-b">
					<div class="flex items-center">
						<Checkbox v-model="selectedRepos[id]" :binary="true" class="mr-3" />
						<span>{{ repo.repoName }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Import Closed Issues Toggle -->
		<div class="mt-6 flex items-center justify-between">
			<span>Do you want to import data for closed issues?</span>
			<ToggleButton v-model="importClosedIssues" />
		</div>

		<!-- Footer Actions -->
		<template #footer>
			<div class="flex justify-between">
				<Button label="Back" icon="pi pi-arrow-left" class="p-button-text" />
				<Button label="Next" icon="pi pi-arrow-right" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
	import { ref, watch, onMounted } from 'vue';
	import { useToast } from 'primevue/usetoast';
	import { useProjectStore } from '@/stores/proj/useProjectStore';
	import { useRoute } from 'vue-router';
	import axios from 'axios';
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
	});

	const emit = defineEmits(['update:modelValue']);
	const projectStore = useProjectStore();
	const toast = useToast();
	const repositories = ref({});
	const isVisible = ref(props.modelValue);
	const searchQuery = ref('');
	const selectedRepos = ref({});
	const importClosedIssues = ref(false);
	const organizationName = ref('three-ping');
	const enabledBy = ref('letterh.dev');
	const enabledDate = ref('Dec 7, 2024');
	const githubInstallationId = ref(null);


	const fetchRepositories = async (installationId) => {
		try {
			console.log('Starting request for installationId:', installationId);
			// Replace with your actual API call
			const response = await axios.get(`/github/repositories/installations/${installationId}`);

			if (response.data.success) {
				const resultData = response.data.data;
				console.log(resultData);

				// Create a new object to hold all repositories
				const repoObject = {};
				resultData.forEach(repo => {
					const repoId = repo.repoId;
					console.log(repoId);
					repoObject[repoId] = { ...repo };
				});

				// Assign the entire object at once to maintain reactivity
				repositories.value = repoObject;
			}
			else {
				console.log("response data fail")
			}
		} catch (error) {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to load repositories',
				life: 3000
			});
		}
	};
	onMounted(async () => {
		githubInstallationId.value = await projectStore.getInstallationId(props.projectId);
		await fetchRepositories(githubInstallationId.value);
	});

	// Watch for changes in props.modelValue
	watch(() => props.modelValue, (newValue) => {
		isVisible.value = newValue;
	});

	// Watch for changes in isVisible
	watch(() => isVisible.value, (newValue) => {
		emit('update:modelValue', newValue);
	});


</script>

<style lang="scss" scoped>
	.step-item {
		@apply flex-1 text-center;

		.step-circle {
			@apply w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-2 text-sm;

			&.active {
				@apply bg-blue-500 text-white;
			}
		}
	}

	.step-line {
		@apply flex-1 h-px bg-gray-300 mx-2 my-4;
	}

	.org-item {
		&:hover {
			@apply bg-gray-50;
		}
	}

	.repositories-list {
		max-height: 300px;
		overflow-y: auto;
	}

	.repo-item {
		&:hover {
			@apply bg-gray-50;
		}
	}
</style>