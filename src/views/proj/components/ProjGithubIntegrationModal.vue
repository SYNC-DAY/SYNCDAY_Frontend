<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" :modal="true" class="github-integration-dialog"
		:style="{ width: '600px' }">
		<template #header>
			<div class="dialog-header">
				<h3>GitHub Integration</h3>

			</div>
		</template>

		<!-- Organizations Section -->
		<section class="organizations-section">
			<div class="organizations-header">
				<h4>Connected organizations</h4>
				<Button icon="pi pi-plus" class="p-button-text" @click="githubAppStore.openInstallationWindow" />
			</div>

			<!-- Organizations List -->
			<div class="organizations-list">
				<div v-for="installation in githubAppStore.installations" :key="installation.installationId"
					class="organization-item">
					<div class="org-info">
						<Avatar :image="installation.avatarUrl" :label="getInitials(installation.accountName)"
							shape="circle" />
						<div class="org-details">
							<span class="org-name">{{ installation.accountName }}</span>
							<span class="org-date">
								Enabled by {{ installation.accountName }} on {{ formatDate(installation.createdAt) }}
							</span>
						</div>
					</div>
					<div class="org-status">
						<span class="status-indicator"></span>
						Connected
						<i class="pi pi-chevron-down"></i>
					</div>
				</div>
			</div>


		</section>
	</Dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore'
import { useGithubAppStore } from '@/stores/github/useGithubAppStore'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue'

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

const emit = defineEmits(['update:visible'])

// Store and service initialization
const githubAuthStore = useGithubAuthStore()
const githubAppStore = useGithubAppStore()
const toast = useToast()
const confirm = useConfirm()

// Refs
const accountMenu = ref()
const accountMenuItems = ref([{
	label: 'Revoke Access',
	icon: 'pi pi-trash',
	command: () => confirmRevokeAccess()
}])

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
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

const openGithubLoginWindow = () => {
	githubAuthStore.loginWithGithub()
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
.github-integration-dialog {
	color: var(--text-color);
}

.dialog-header {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.dialog-header h3 {
	font-size: 1.5rem;
	margin: 0;
}

.text-secondary {
	font-size: 0.9rem;
	color: var(--text-secondary);
}

.account-section,
.organizations-section {
	margin: 1.5rem 0;
	padding: 1rem;
	border-radius: 0.5rem;
	border: 1px solid var(--border-color);
}

.section-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.account-info h4 {
	margin: 0 0 0.25rem;
	font-size: 1rem;
}

.user-profile {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.profile-details {
	display: flex;
	align-items: center;
}

.user-info {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.connection-status,
.org-status {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.status-indicator {
	width: 8px;
	height: 8px;
	background: var(--success-color);
	border-radius: 50%;
}

.organizations-header {
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

.organization-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem;
	border-radius: 0.375rem;
	border: 1px solid var(--border-color);
}

.org-info {
	display: flex;
	align-items: center;
	gap: 1rem;
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
	font-size: 0.8rem;
	color: var(--text-secondary);
}
</style>