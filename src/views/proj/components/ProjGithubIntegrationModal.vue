<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" :modal="true" class=""
		:style="{ width: '70vw' }" header="Github Integration">
		<!-- Progress Steps -->
		<!-- Main Content -->
		<div class="container-col gap-1rem">

			<!-- Connected Organizations -->
			<div class="organizations-section">
				<div class="section-header">
					<strong>Connected organizations</strong>
					<Button icon="pi pi-plus" class="p-button-text" @click="" />
				</div>

				<div class="organizations-list">
					<div v-for="org in organizations" :key="org.id" class="org-item">
						<div class="org-info">
							<Avatar :image="org.avatarUrl" :label="getInitials(org.name)" shape="square" size="large"
								class="org-avatar" />
							<div class="org-details">
								<span class="org-name">{{ org.name }}</span>
								<span class="org-date">Enabled by {{ org.enabledBy }} on {{ formatDate(org.enabledDate)
									}}</span>
							</div>
						</div>
						<div class="org-status">
							<span class="status-dot"></span>
							<span>Connected</span>
							<Button icon="pi pi-chevron-down" class="p-button-text p-button-sm" @click="showOrgMenu" />
						</div>
					</div>
				</div>
			</div>

			<!-- Repository Selection -->
			<div class="gap-1rem">
				<div class="container-col gap-1rem">
					<strong>Select repositories to import</strong>
					<InputText v-model="searchQuery" placeholder="Filter repositories" class="w-full mb-4" />
				</div>
				<div class="repository-list">
					<div v-for="repo in filteredRepos" :key="repo.id" class="repo-item">
						<Checkbox v-model="repo.selected" :binary="true" :inputId="repo.id" />
						<label :for="repo.id" class="repo-name">{{ repo.name }}</label>
					</div>
				</div>
			</div>

			<!-- Import Options -->


		</div>
	</Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
// Props
const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	}
})

const emit = defineEmits(['update:visible'])


/* stores */
// const githubAppstores =

// State
const searchQuery = ref('')
const importClosedIssues = ref(false)

const organizations = ref([
	{
		id: 1,
		name: 'three-ping',
		enabledBy: 'letterh.dev',
		enabledDate: '2024-12-07',
		avatarUrl: ''
	}
])

const repositories = ref([
	{
		id: 'repo1',
		name: 'three-ping/MUDIUM',
		selected: false
	}
])

// Computed
const filteredRepos = computed(() => {
	return repositories.value.filter(repo =>
		repo.name.toLowerCase().includes(searchQuery.value.toLowerCase())
	)
})

// Methods
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue)
}

const getInitials = (name) => {
	return name
		.split(/[\s-]/g)
		.map(word => word[0])
		.join('')
		.toUpperCase()
		.substring(0, 2)
}

const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	})
}

const addOrganization = () => {
	// Implement organization addition logic
}

const showOrgMenu = () => {
	// Implement menu display logic
}
</script>

<style scoped>
.linear-style-dialog {
	--linear-accent: #5E6AD2;
	--linear-border: #2E2E36;
	--linear-text-secondary: #8A8F98;
	color: #fff;
	background: #1C1C1F;
}

.steps-container {
	padding: 1rem 0;
}

.steps-wrapper {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 2rem;
}

.step {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
}

.step-circle {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: var(--linear-border);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	color: var(--linear-text-secondary);
}

.step.active .step-circle {
	background: var(--linear-accent);
	color: white;
}

.step-label {
	font-size: 12px;
	color: var(--linear-text-secondary);
}

.step.active .step-label {
	color: white;
}

.step-line {
	flex: 1;
	height: 2px;
	background: var(--linear-border);
	margin: 0 0.5rem;
}

.step-line.active {
	background: var(--linear-accent);
}

.content-section {
	padding: 1rem 2rem;
}

.section-title {
	font-size: 1.5rem;
	font-weight: 600;
	margin-bottom: 2rem;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.organizations-list {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.org-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem;
	border-radius: 6px;
	border: 1px solid var(--linear-border);
}

.org-info {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.org-avatar {
	background: var(--linear-border);
}

.org-details {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.org-name {
	font-weight: 500;
}

.org-date {
	font-size: 0.875rem;
	color: var(--linear-text-secondary);
}

.org-status {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #3FB950;
}

.repository-section {
	margin-top: 2rem;
}

.repository-list {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.repo-item {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	padding: 0.5rem;
	border-radius: 4px;
}

.repo-name {
	font-size: 0.875rem;
}

.import-options {
	margin-top: 2rem;
}

.option-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 0;
}

:deep(.p-dialog-content) {
	padding: 0;
	background: #1C1C1F;
}

:deep(.p-dialog-header) {
	display: none;
}



:deep(.p-checkbox) {
	width: 1.25rem;
	height: 1.25rem;
}

:deep(.p-button.p-button-text) {
	color: var(--linear-text-secondary);
}

:deep(.p-button.p-button-text:hover) {
	background: rgba(255, 255, 255, 0.1);
}
</style>