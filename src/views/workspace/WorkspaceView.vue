<template>
	<div class="container mx-auto px-4">
		<!-- Loading State -->
		<div
			v-if="isLoading"
			class="flex justify-center items-center py-8">
			<ProgressSpinner />
			<span class="ml-2">Loading workspace...</span>
		</div>

		<!-- Error State -->
		<div
			v-else-if="error"
			class="text-center py-8">
			<p class="text-red-500 mb-4">{{ error }}</p>
			<Button
				label="Retry"
				@click="fetchWorkspace" />
		</div>

		<!-- Main Content -->
		<template v-else-if="workspaceDetails">
			<!-- Workspace Header -->
			<WorkspaceHeader
				:workspace-name="workspaceDetails.workspace_name"
				@open-repo-settings="showModal = true"
				@open-milestone-selection="showMilestoneSelection = true"
				@open-tag-manager="showTagDialog = true" />

			<!-- View Selector -->
			<Tabs v-model:activeIndex="activeTab">
				<TabList>
					<Tab>CardBoard</Tab>
					<Tab>Kanban</Tab>
					<Tab>Calendar</Tab>
				</TabList>

				<TabPanels>
					<TabPanel>
						<CardBoard
							:cardboards="workspaceDetails.cardboards"
							:workspace-id="workspaceDetails.workspace_id" />
					</TabPanel>
					<TabPanel>
						<KanbanBoard :cardboards="workspaceDetails.cardboards" />
					</TabPanel>
					<TabPanel>
						<CalendarView :cardboards="workspaceDetails.cardboards" />
					</TabPanel>
				</TabPanels>
			</Tabs>

			<!-- Modals -->
			<TagManager
				v-model:visible="showTagDialog"
				:workspace-id="workspaceId"
				@update:tags="handleTagsUpdate" />

			<RepoSettingModal
				v-model="showModal"
				:project-id="projectId"
				:workspace-id="workspaceId"
				:workspace-data="workspaceDetails"
				@update="updateRepositoryInfo" />

			<MilestoneSelection
				:is-open="showMilestoneSelection"
				:installationId="installationId"
				:repo-url="workspaceDetails?.vcs_repo_url"
				:project-id="projectId"
				:workspace-id="workspaceId"
				@close="showMilestoneSelection = false" />

			<CardModal
				v-if="showCardModal"
				:show="showCardModal"
				:card="selectedCard"
				@close="handleCloseModal" />
		</template>

		<!-- Empty State -->
		<div
			v-else
			class="text-center py-8 text-gray-500">
			No workspace data available
		</div>
	</div>
</template>

<script setup>
	import { ref, onMounted, watch, provide } from "vue";
	import { useRoute, useRouter } from "vue-router";
	import { useProjectStore } from "@/stores/proj/useProjectStore";
	import { useToast } from "primevue/usetoast";
	import MilestoneSelection from "./components/MilestoneSelection.vue";
	import WorkspaceHeader from "./components/WorkspaceHeader.vue";
	import TagManager from "./components/TagManager.vue";

	const props = defineProps({
		projectId: {
			type: [String, Number],
			required: true,
		},
		workspaceId: {
			type: [String, Number],
			required: true,
		},
		cardId: {
			type: [String, Number],
			default: null,
		},
	});

	// Store & Router
	const route = useRoute();
	const router = useRouter();
	const projectStore = useProjectStore();
	const toast = useToast();

	// State
	const isLoading = ref(false);
	const error = ref(null);
	const workspaceDetails = ref(null);
	const showModal = ref(false);
	const showMilestoneSelection = ref(false);
	const showTagDialog = ref(false);
	const showCardModal = ref(false);
	const selectedCard = ref(null);
	const activeTab = ref(0);
	const installationId = ref(null);

	// Methods
	const fetchWorkspace = async () => {
		isLoading.value = true;
		try {
			workspaceDetails.value = await projectStore.fetchWorkspace(props.projectId, props.workspaceId);
		} catch (err) {
			error.value = "Failed to load workspace";
			console.error("Workspace fetch error:", err);
		} finally {
			isLoading.value = false;
		}
	};

	const fetchInstallationId = async () => {
		try {
			installationId.value = await projectStore.getInstallationId(props.projectId);
		} catch (err) {
			console.error("Installation ID fetch error:", err);
			toast.add({
				severity: "error",
				summary: "Error",
				detail: "Failed to fetch GitHub installation ID",
			});
		}
	};

	const handleCloseModal = () => {
		router.replace({
			query: {
				...route.query,
				cardId: undefined,
			},
		});
	};

	const updateRepositoryInfo = repoInfo => {
		workspaceDetails.value = {
			...workspaceDetails.value,
			...repoInfo,
		};
		projectStore.updateWorkspace(workspaceDetails.value);
	};

	const handleTagsUpdate = tags => {
		// Update local tags state if needed
		console.log("Tags updated:", tags);
	};

	const findCardInWorkspace = cardId => {
		if (!workspaceDetails.value?.cardboards) return null;

		for (const cardboard of workspaceDetails.value.cardboards) {
			const card = cardboard.cards?.find(c => c.card_id === Number(cardId));
			if (card) return card;
		}
		return null;
	};

	// Watchers
	watch([() => props.workspaceId, () => props.projectId, () => route.query.cardId], async ([newWorkspaceId, newProjectId, newCardId], [oldWorkspaceId, oldProjectId, oldCardId]) => {
		// Workspace or project changed
		if ((newWorkspaceId && newWorkspaceId !== oldWorkspaceId) || (newProjectId && newProjectId !== oldProjectId)) {
			await fetchWorkspace();
		}

		// Card ID changed
		if (newCardId !== oldCardId) {
			if (newCardId) {
				if (!workspaceDetails.value) {
					await fetchWorkspace();
				}

				const card = findCardInWorkspace(newCardId);
				if (card) {
					selectedCard.value = card;
					showCardModal.value = true;
				} else {
					toast.add({
						severity: "warning",
						summary: "Card Not Found",
						detail: "The requested card could not be found",
					});
				}
			} else {
				showCardModal.value = false;
				selectedCard.value = null;
			}
		}
	});

	// Lifecycle
	onMounted(async () => {
		await Promise.all([fetchInstallationId(), fetchWorkspace()]);
	});
</script>
