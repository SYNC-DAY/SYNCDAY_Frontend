<template>
	<Dialog v-model:visible="isVisible" modal header="Set GitHub Repository" :style="{ width: '50vw' }"
		:closable="true">

		<div>
			<Listbox v-model="selectedRepo" :options="repositories" filter optionLabel="name" />
		</div>


		<!-- Footer Actions -->
		<template #footer>
			<div class="flex justify-between">
				<!-- <Button label="Back" icon="pi pi-arrow-left" class="p-button-text" /> -->
				<Button label="Save" icon="pi pi-check" @click="onClickSave" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
	import { ref, watch, onMounted } from 'vue';
	import { useToast } from 'primevue/usetoast';
	import { useProjectStore } from '@/stores/proj/useProjectStore';
	import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
	import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';
	import { useRoute } from 'vue-router';

	import axios from 'axios';
	import { useGithubProjectsStore } from '@/stores/github/useGithubProjectsStore';
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
		workspaceData: {
			type: Object,
			required: true
		}
	});

	const emit = defineEmits(['update:modelValue', 'update:updateRepositoryInfo']);
	const projectStore = useProjectStore();
	const toast = useToast();
	const repositories = ref([]);
	const isVisible = ref(props.modelValue);
	const selectedRepo = ref();
	const githubInstallationId = ref(null);
	const githubAppStore = useGithubAppStore();
	const githubRepoStore = useGithubRepoStore();
	const fetchRepositories = async (installationId) => {
		if (!installationId) {
			return;
		}
		try {
			console.log('Starting request for installationId:', installationId);
			// The response is the array of repositories directly
			const repos = await githubRepoStore.fetchRepositories(installationId);
			repositories.value = repos;
			console.log('Fetched repositories:', repos);
		} catch (error) {
			console.error('Error fetching repositories:', error);
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to load repositories',
				life: 3000
			});
		}
	};


	// Watch for changes in props.modelValue
	watch(() => props.modelValue, async (newValue) => {
		isVisible.value = newValue;

		if (newValue === true) {
			const id = projectStore.getInstallationId(props.projectId);
			if (!id) {
				toast.add({
					severity: 'error',
					summary: 'Error',
					detail: 'No GitHub installation found',
					life: 3000
				});
				return;
			}
			githubInstallationId.value = id;
			await fetchRepositories(id);
		}
	});

	// Watch for changes in isVisible
	watch(() => isVisible.value, (newValue) => {
		emit('update:modelValue', newValue);
	});

	const onClickSave = async () => {
		if (!selectedRepo.value) {
			toast.add({
				severity: 'warn',
				summary: 'Warning',
				detail: 'Please select a repository',
				life: 3000
			});
			return;
		}

		try {
			const projMemberId = await projectStore.getProjMemberId(props.projectId);

			const updateData = {
				workspace_id: String(props.workspaceId),
				proj_id: String(props.projectId),
				workspace_name: String(props.workspaceData.workspace_name),
				vcs_repo_name: String(selectedRepo.value.name),
				vcs_repo_url: String(selectedRepo.value.html_url),
				proj_member_id: projMemberId
			};
			console.log(updateData)
			// await projectStore.updateWorkspace({ ...props.workspaceData, ...updateData });

			// Emit a simple object with only necessary data
			emit('update', {
				vcs_repo_name: selectedRepo.value.name,
				vcs_repo_url: selectedRepo.value.html_url
			});

			closeModal();
		} catch (error) {
			console.error('Error saving workspace:', error);
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to save repository selection',
				life: 3000
			});
		}
	};
	const closeModal = () => {
		selectedRepo.value = null
		emit('update:modelValue', false)
	}

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