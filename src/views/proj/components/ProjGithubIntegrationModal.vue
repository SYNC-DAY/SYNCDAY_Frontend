<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" :modal="true" class="linear-dialog"
		:style="{ width: '600px' }">
		<template #header>
			<div class="dialog-header container-col gap-1rem">
				<h3>GitHub Integration</h3>
				<p class="subtitle">
					Automate your pull request and commit workflows and keep issues synced both ways
				</p>
			</div>
		</template>

		<!-- Personal Account Section -->
		<div class="section-container">
			<div class="account-section">
				<div class="section-content">
					<div class="account-info">
						<h4>Personal account connected</h4>
						<p class="text-secondary">You have connected your GitHub account to SyncDay</p>
					</div>
					<div class="account-status">
						<h4>Personal account {{ githubAuthStore.isAuthenticated ? 'connected' : 'not connected' }}</h4>
						<p class="text-secondary">
							{{ githubAuthStore.isAuthenticated
								? `Connected as ${githubAuthStore.username}`
								: 'Connect your GitHub account to SyncDay'
							}}</p>
					</div>
					<div v-if="!githubAuthStore.isAuthenticated">
						<Button label="Connect GitHub" icon="pi pi-github" @click="openGithubLoginWindow" />
					</div>
					<div v-else class="account-status">
						<span class="status-dot"></span>
						{{ githubAuthStore.username }}
						<Menu ref="accountMenu" :model="accountMenuItems" :popup="true" />
						<Button icon="pi pi-chevron-down" @click="(event) => accountMenu.toggle(event)" text />
					</div>
				</div>
			</div>
		</div>

		<!-- Organizations Section -->
		<div class="section-container">
			<div class="organizations-header">
				<h4>Connected organizations</h4>
				<Button icon="pi pi-plus" class="p-button-text" @click="githubAppStore.openInstallationWindow" />
			</div>

			<div class="organizations-list">
				<div v-for="installation in githubAppStore.installations" :key="installation.installationId"
					class="organization-item">
					<div class="org-info">
						<Avatar :image="installation.avatarUrl" :label="getInitials(installation.accountName)"
							shape="circle" />
						<div class="org-details">
							<span class="org-name">{{ installation.accountName }}</span>
							<span class="org-date">Enabled by {{ installation.accountName }} on {{
								formatDate(installation.createdAt) }}</span>
						</div>
					</div>
					<div class="org-status">
						<span class="status-dot"></span>
						Connected
						<i class="pi pi-chevron-down"></i>
					</div>
				</div>
			</div>
		</div>

	</Dialog>
</template>

<style scoped>
.linear-dialog {
	color: #fff;
}



.dialog-header h3 {
	font-size: 1.5rem;
	margin-bottom: 0.5rem;
}

.subtitle {
	font-size: 0.9rem;
}

.section-container {
	margin: 1.5rem 0;
	padding: 1rem;
	border-radius: 8px;
}

.account-section {
	padding: 0.5rem;
}

.section-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.account-info h4 {
	margin-bottom: 0.25rem;
	font-size: 1rem;
}

.text-secondary {
	font-size: 0.9rem;
}

.account-status,
.org-status {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem;
	border-radius: 6px;
	cursor: pointer;
}

.status-dot {
	width: 8px;
	height: 8px;
	background: #22c55e;
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
	border: 1px solid var(--outline-gray);
	border-radius: 5px;
}

.organization-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0.75rem;
	border-radius: 6px;
	transition: background-color 0.2s;
}



.org-info {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.org-details {
	display: flex;
	flex-direction: column;
}

.org-name {
	font-weight: 500;
}

.org-date {
	font-size: 0.8rem;
	color: #888;
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue';


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
});

// Emits
const emit = defineEmits(['update:visible']);

// Stores and Services
const githubAuthStore = useGithubAuthStore();
const githubAppStore = useGithubAppStore();
const toast = useToast();
const confirm = useConfirm();

// Refs

const accountMenu = ref();
const searchQuery = ref('');

const accountMenuItems = ref([
	{
		label: 'Revoke Access',
		icon: 'pi pi-trash',
		command: () => confirmRevokeAccess()
	}
]);

// Methods
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);
};

const filteredInstallations = computed(() => {
	if (!searchQuery.value) return githubAppStore.installations;

	return githubAppStore.installations.filter(installation =>
		installation.accountName.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
});


const getInitials = (name) => {
	return name.split(' ')
		.map(word => word[0])
		.join('')
		.toUpperCase()
		.substring(0, 2);
};
const formatDate = (date) => {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
};

// 로그인 창 열기

const confirmRevokeAccess = () => {
	confirm.require({
		message: 'Are you sure you want to revoke GitHub access?',
		header: 'Revoke Access',
		icon: 'pi pi-exclamation-triangle',
		accept: async () => {
			try {
				await githubAuthStore.revokeAccess();
				toast.add({
					severity: 'success',
					summary: 'Success',
					detail: 'GitHub access has been revoked',
					life: 3000
				});
			} catch (error) {
				toast.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed to revoke access',
					life: 3000
				});
			}
		}
	});
};
const openGithubLoginWindow = () => {
	// store의 loginWithGithub 메서드 직접 사용
	githubAuthStore.loginWithGithub();
};



const handleAuthMessage = async (event) => {
	if (event.origin !== window.location.origin) return;

	const { type, data } = event.data;

	switch (type) {
		case 'github-auth-success':
			await githubAppStore.fetchInstallations();
			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: 'GitHub account connected successfully',
				life: 3000
			});
			break;

		case 'github-installation-success':
			await githubAppStore.fetchInstallations();
			toast.add({
				severity: 'success',
				summary: 'Success',
				detail: 'GitHub app installed successfully',
				life: 3000
			});
			break;

		case 'github-error':
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: data || 'GitHub operation failed',
				life: 3000
			});
			break;
	}
};

// 하나의 메시지 핸들러만 사용
onMounted(() => {
	window.addEventListener('message', handleAuthMessage);
});

onUnmounted(() => {
	window.removeEventListener('message', handleAuthMessage);
	githubAppStore.cleanup();
});


</script>

<style scoped>
.p-dialog-content {
	padding: 1.5rem;
}
</style>