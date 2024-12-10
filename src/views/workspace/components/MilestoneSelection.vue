<template>
	<Dialog
		v-if="showNoInstallationWarning"
		:visible="true"
		modal
		header="Missing GitHub Installation"
		:style="{ width: '400px' }"
		@hide="handleClose">
		<div class="p-4 text-center">
			<i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-4" />
			<p class="mb-4">GitHub installation is required to access milestones.</p>
			<p class="text-sm text-gray-500">Please install GitHub integration first.</p>
		</div>
		<template #footer>
			<Button
				label="Close"
				class="p-button-outlined"
				@click="handleClose" />
		</template>
	</Dialog>

	<Dialog
		v-model:visible="isVisible"
		modal
		header="Select GitHub Milestone"
		:style="{ width: '80vw', maxWidth: '900px' }"
		@hide="handleClose">
		<!-- Loading State -->
		<div
			v-if="!isReady"
			class="flex justify-center items-center p-8">
			<ProgressSpinner />
			<span class="ml-2">Loading configuration...</span>
		</div>

		<!-- Main Content -->
		<div
			v-else
			class="grid grid-cols-2 gap-4">
			<!-- Milestones Panel -->
			<MilestonesPanel
				:milestones="milestones"
				:selected-milestone="selectedMilestone"
				:is-loading="isLoadingMilestones"
				@select="handleMilestoneClick" />

			<!-- Issues Panel -->
			<IssuesPanel
				:issues="milestoneIssues"
				:selected-milestone="selectedMilestone"
				:is-loading="isLoadingIssues" />
		</div>

		<template #footer>
			<div class="flex justify-end gap-2">
				<Button
					label="Cancel"
					class="p-button-outlined"
					:disabled="isLoading"
					@click="handleClose" />
				<Button
					label="Convert to Cardboard"
					:loading="isLoading"
					:disabled="!canSave"
					@click="handleSave" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
	import { ref, computed, watch, onMounted, inject } from "vue";
	import { useGithubMilestoneStore } from "@/stores/github/useGithubMilestoneStore";
	import { useGithubIssueStore } from "@/stores/github/useGithubIssueStore";
	import { useCardboardStore } from "@/stores/proj/useCardboardStore";
	import { useAuthStore } from "@/stores/auth";
	import { useToast } from "primevue/usetoast";
	import MilestonesPanel from "./MilestonesPanel.vue";
	import IssuesPanel from "./IssuesPanel.vue";

	const props = defineProps({
		isOpen: Boolean,
		repoUrl: String,
		projectId: [String, Number],
		workspaceId: [String, Number],
		installationId: { type: Number, required: false },
	});

	const emit = defineEmits(["close"]);

	// Store instances
	const milestoneStore = useGithubMilestoneStore();
	const issueStore = useGithubIssueStore();
	const cardboardStore = useCardboardStore();
	const authStore = useAuthStore();
	const toast = useToast();

	// State
	const isLoading = ref(false);
	const isLoadingMilestones = ref(false);
	const isLoadingIssues = ref(false);
	const milestones = ref([]);
	const selectedMilestone = ref(null);
	const milestoneIssues = ref([]);
	const repoInfo = ref({ owner: "", repo: "" });

	// Computed
	const isVisible = computed({
		get: () => props.isOpen,
		set: value => {
			if (!value) handleClose();
		},
	});

	const showNoInstallationWarning = computed(() => props.isOpen && !props.installationId);

	const isReady = computed(() => !!props.installationId && !!repoInfo.value.owner && !!repoInfo.value.repo);

	const canSave = computed(() => !isLoading.value && selectedMilestone.value && milestoneIssues.value.length > 0);

	// Methods
	const parseRepoUrl = url => {
		try {
			const parts = url.split("/");
			return {
				owner: parts[3],
				repo: parts[4],
			};
		} catch (error) {
			console.error("Error parsing repo URL:", error);
			return { owner: "", repo: "" };
		}
	};

	const showError = message => {
		toast.add({
			severity: "error",
			summary: "Error",
			detail: message,
			life: 3000,
		});
	};

	const loadMilestones = async () => {
		if (!isReady.value) return;

		isLoadingMilestones.value = true;
		try {
			const { owner, repo } = repoInfo.value;
			milestones.value = await milestoneStore.fetchMilestones(props.installationId, owner, repo);
		} catch (error) {
			showError("Failed to load milestones");
			console.error("Milestone fetch error:", error);
		} finally {
			isLoadingMilestones.value = false;
		}
	};

	const handleMilestoneClick = async milestone => {
		selectedMilestone.value = milestone;
		isLoadingIssues.value = true;

		try {
			const { owner, repo } = repoInfo.value;
			milestoneIssues.value = await issueStore.fetchIssuesByMilestone(props.installationId, owner, repo, milestone.number);
		} catch (error) {
			console.error("Failed to fetch milestone issues:", error);
			showError("Failed to load milestone issues");
			milestoneIssues.value = [];
		} finally {
			isLoadingIssues.value = false;
		}
	};

	const mapIssueToCard = issue => ({
		user_id: authStore.user.userId,
		title: issue.title,
		content: issue.body || "",
		status: issue.state === "OPEN" ? "TODO" : "DONE",
		created_at: issue.createdAt,
		updated_at: issue.updatedAt,
		assignee: issue.assignees?.[0]?.login || "",
		assignee_avatar: issue.assignees?.[0]?.avatarUrl || "",
		vcs_object_type: "ISSUE",
		vcs_object_url: issue.url,
	});

	const handleSave = async () => {
		if (!canSave.value) return;

		isLoading.value = true;
		try {
			const request = {
				project_id: props.projectId,
				workspace_id: props.workspaceId,
				title: selectedMilestone.value.title,
				due_date: selectedMilestone.value.due_on,
				progress_status: selectedMilestone.value.progress_percentage,
				vcs_type: "GITHUB",
				cards: milestoneIssues.value.map(mapIssueToCard),
			};

			await cardboardStore.createCardboardWithCards(request);
			handleClose();
		} catch (error) {
			console.error("Failed to convert milestone to cardboard:", error);
			showError("Failed to create cardboard");
		} finally {
			isLoading.value = false;
		}
	};

	const handleClose = () => {
		selectedMilestone.value = null;
		milestoneIssues.value = [];
		emit("close");
	};

	const resetState = () => {
		milestones.value = [];
		selectedMilestone.value = null;
		milestoneIssues.value = [];
		isLoading.value = false;
		isLoadingMilestones.value = false;
		isLoadingIssues.value = false;
	};

	// Watchers
	watch(
		() => props.isOpen,
		async newValue => {
			if (newValue && isReady.value) {
				await loadMilestones();
			} else {
				resetState();
			}
		}
	);

	// Lifecycle
	onMounted(() => {
		if (props.repoUrl) {
			repoInfo.value = parseRepoUrl(props.repoUrl);
		}
	});
</script>
