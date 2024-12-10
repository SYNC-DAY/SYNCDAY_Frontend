<template>
	<Dialog
		v-if="showNoInstallationWarning"
		:visible="true"
		:modal="true"
		:closable="true"
		header="Missing GitHub Installation"
		:style="{ width: '400px' }"
		:closeOnEscape="true"
		@hide="handleClose">
		<div class="p-4 text-center">
			<i class="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-4" />
			<p class="mb-4">GitHub installation is required to access milestones.</p>
			<p class="text-sm text-gray-500">Please install GitHub integration first.</p>
		</div>
		<template #footer>
			<div class="flex justify-end">
				<Button
					label="Close"
					class="p-button-outlined"
					@click="handleClose" />
			</div>
		</template>
	</Dialog>
	<Dialog
		v-model:visible="isVisible"
		:modal="true"
		:closable="true"
		header="Select GitHub Milestone"
		:style="{ width: '80vw', maxWidth: '900px' }"
		:closeOnEscape="true"
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
			<!-- Milestones List -->
			<div class="border rounded-lg p-4">
				<h3 class="font-medium mb-4">Milestones</h3>
				<div
					v-if="isLoadingMilestones"
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
						@click="handleMilestoneClick(milestone)"
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

			<!-- Issues List -->
			<div class="border rounded-lg p-4">
				<h3 class="font-medium mb-4">Milestone Issues</h3>
				<div
					v-if="isLoadingIssues"
					class="flex justify-center p-4">
					<ProgressSpinner />
				</div>
				<div
					v-else-if="!selectedMilestone"
					class="text-center p-4 text-gray-500">
					Select a milestone to view issues
				</div>
				<div
					v-else-if="!milestoneIssues.length"
					class="text-center p-4 text-gray-500">
					No issues found in this milestone
				</div>
				<div
					v-else
					class="space-y-2">
					<div
						v-for="issue in milestoneIssues"
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
		</div>

		<!-- Footer -->
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
	import Dialog from "primevue/dialog";
	import Button from "primevue/button";
	import ProgressBar from "primevue/progressbar";
	import ProgressSpinner from "primevue/progressspinner";
	const installationId = inject("installationId");
	const props = defineProps({
		isOpen: {
			type: Boolean,
			required: true,
		},

		repoUrl: {
			type: String,
			required: false,
		},
		// ... (keep other existing props)
	});
	const showNoInstallationWarning = computed(() => {
		return props.isOpen && !props.installationId;
	});
	// Emits
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

	const isReady = computed(() => {
		return !!installationId || (!!repoInfo.value.owner && !!repoInfo.value.repo);
	});

	const canSave = computed(() => {
		return !isLoading.value && selectedMilestone.value && milestoneIssues.value.length > 0;
	});

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

	const formatDate = dateString => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatAssignees = assignees => {
		return assignees.map(a => a.login).join(", ");
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
		isLoadingMilestones.value = true;
		try {
			const { owner, repo } = repoInfo.value;

			milestones.value = await milestoneStore.fetchMilestones(props.installationId, owner, repo);
		} catch (error) {
			console.error("Failed to fetch milestones:", error);
			showError("Failed to load milestones");
			handleClose();
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

	watch(
		() => props.isOpen,
		async newValue => {
			if (newValue) {
				if (!props.installationId) {
					// No need to do anything here as the warning dialog will show
					return;
				}
				if (isReady.value) {
					await loadMilestones();
				}
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

<style scoped>
	:deep(.p-dialog-header) {
		padding: 1.5rem;
	}

	:deep(.p-dialog-content) {
		padding: 0 1.5rem 1.5rem 1.5rem;
	}

	:deep(.p-dialog-footer) {
		padding: 1rem 1.5rem;
		border-top: 1px solid #e5e7eb;
	}
</style>
