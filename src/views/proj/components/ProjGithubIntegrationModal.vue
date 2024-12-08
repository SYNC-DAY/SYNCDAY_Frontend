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
					<Button icon="pi pi-plus" class="p-button-text" @click="addOrganization" />
				</div>

				<div class="organizations-list">
					<div v-for="installation in githubAppStore.installations" :key="installation.id" class="org-item">
						<div class="org-select">
							<RadioButton :value="installation.id" v-model="selectedInstallationId"
								:inputId="'org_' + installation.id" />
						</div>
						<div class="org-info">
							<Avatar :image="installation.avatarUrl" :label="getInitials(installation.accountName)"
								shape="square" size="large" class="org-avatar" />
							<div class="org-details">
								<span class="org-name">{{ installation.accountName }}</span>
								<span class="org-date">Enabled on {{ formatDate(installation.createdAt) }}</span>
							</div>
						</div>
						<div class="org-status">
							<span class="status-dot"></span>
							<span>Connected</span>
							<Button icon="pi pi-chevron-down" @click="(event) => openMenu(event, installation.id)"
								aria-haspopup="true" aria-controls="overlay_menu" class="p-button-text" />
						</div>
					</div>
				</div>
			</div>
			<div class="container-row justify-right">
				<Button label="Save" :loading="loading" :disabled="!selectedInstallationId" @click="handleSave"
					class="p-button-primary" />
			</div>
			<Menu ref="menu" :model="currentMenuItems" :popup="true" />

		</div>
	</Dialog>
</template>

<script setup>
	import { ref, computed, onMounted, onUnmounted } from 'vue'
	import { useToast } from 'primevue/usetoast'
	import { useAuthStore } from '@/stores/auth';

	import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
	import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';

	import { useConfirm } from 'primevue';
	import { useProjectStore } from '@/stores/proj/useProjectStore';

	// Props
	const props = defineProps({
		visible: {
			type: Boolean,
			required: true
		},
		projectId: {
			type: Number,
			required: true
		},
		projectData: {
			type: Object,
			required: true
		}
	})

	const emit = defineEmits(['update:visible', 'update:project'])


	/* stores */
	const authStore = useAuthStore();
	const projectStore = useProjectStore();
	const githubAuthStore = useGithubAuthStore()
	const githubAppStore = useGithubAppStore()
	const toast = useToast()
	const confirm = useConfirm()


	// State
	const menu = ref(null)
	const currentMenuItems = ref([])
	const currentInstallationId = ref(null)
	const loading = ref(false)
	const error = ref(null)
	// Add this with other refs
	const selectedInstallationId = ref(null)
	// Open menu with correct items
	const openMenu = (event, installationId) => {
		// Prevent any parent handlers from being called
		event.stopPropagation()

		// Set current installation ID
		currentInstallationId.value = installationId

		// Update menu items for this installation
		currentMenuItems.value = [
			{
				label: 'Options',
				items: [
					{
						label: 'Disable',
						icon: 'pi pi-trash',
						command: () => githubAppStore.handleDisableOrg(installationId)
					},
					{
						label: 'Modify',
						icon: 'pi pi-pencil',
						command: () => githubAppStore.handleModifyOrg(installationId)
					}
				]
			}
		]

		// Show the menu at the click position
		menu.value.show(event)
	}

	// Methods
	const handleVisibilityChange = (newValue) => {

		emit('update:visible', newValue)
	}

	const getInitials = (name) => {
		return name
			.split(' ')
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
		githubAppStore.openInstallationWindow();
		// Implement organization addition logic
	}

	const handleInstallationSelect = async (installation) => {
		selectedInstallationId.value = installation.id
		loading.value = true
		error.value = null

		try {
			await projectStore.updateProject({
				...props.projectData,
				vcs_type: 'GITHUB',
				vcs_proj_url: installation.htmlUrl || '',
				github_installation_id: installation.id
			})

			emit('update:project', {
				...props.projectData,
				vcs_type: 'GITHUB',
				vcs_proj_url: installation.htmlUrl || '',
				github_installation_id: installation.installationId
			})
			emit("update:visible", false)

		} catch (err) {
			error.value = err instanceof Error ? err.message : 'Failed to update GitHub integration'
			console.error('GitHub integration error:', err)
		} finally {
			loading.value = false
		}
	}




	const confirmRevokeAccess = () => {
		confirm.require({
			message: 'Are you sure you want to revoke GitHub access?',
			header: 'Revoke Access',
			icon: 'pi pi-exclamation-triangle',
			accept: async () => {
				try {
					await githubAuthStore.revokeAccess()
					toast.add({
						severity: 'success',
						summary: 'Success',
						detail: 'GitHub access has been revoked',
						life: 3000
					})
				} catch (error) {
					toast.add({
						severity: 'error',
						summary: 'Error',
						detail: 'Failed to revoke access',
						life: 3000
					})
				}
			}
		})
	}

	const handleAuthMessage = async (event) => {
		if (event.origin !== window.location.origin) return

		const { type, data } = event.data

		const toastMessages = {
			'github-auth-success': {
				severity: 'success',
				summary: 'Success',
				detail: 'GitHub account connected successfully'
			},
			'github-installation-success': {
				severity: 'success',
				summary: 'Success',
				detail: 'GitHub app installed successfully'
			},
			'github-error': {
				severity: 'error',
				summary: 'Error',
				detail: data || 'GitHub operation failed'
			}
		}

		if (type in toastMessages) {
			if (['github-auth-success', 'github-installation-success'].includes(type)) {
				await githubAppStore.fetchInstallations()
			}

			toast.add({
				...toastMessages[type],
				life: 3000
			})
		}
	}

	const handleSave = async () => {
		if (!selectedInstallationId.value) return;

		const selectedInstallation = githubAppStore.installations[selectedInstallationId.value]

		if (selectedInstallation) {
			await handleInstallationSelect(selectedInstallation);
		}
	}

	// Lifecycle hooks
	onMounted(() => {
		githubAppStore.fetchInstallations();
		window.addEventListener('message', handleAuthMessage)
	})

	onUnmounted(() => {
		window.removeEventListener('message', handleAuthMessage)
		githubAppStore.cleanup()
	})
</script>

<style scoped>
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

	.org-select {
		margin-right: 1rem;
	}

	.org-item {
		display: flex;
		align-items: center;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid var(--linear-border);
		cursor: pointer;
	}
</style>