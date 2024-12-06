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
						<span class="status-dot"></span>
						{{ githubAuthStore.username }}
						<i class="pi pi-chevron-down"></i>
					</div>
				</div>
			</div>
		</div>

		<!-- Organizations Section -->
		<div class="section-container">
			<div class="organizations-header">
				<h4>Connected organizations</h4>
				<Button icon="pi pi-plus" class="p-button-text" @click="openInstallationWindow" />
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

.dialog-header {
	/* margin-bottom: 2rem; */
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
const searchQuery = ref('');
// Refs
const installationWindow = ref(null);
const checkWindowInterval = ref(null);


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
const openInstallationWindow = () => {
	// Save project ID for installation callback
	localStorage.setItem('github_installation_project_id', props.projectId);

	const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
	const callbackUrl = `${window.location.origin}/github/callback`;

	// Add target_type=user parameter to the URL
	const params = new URLSearchParams({
		callback_url: callbackUrl,
		target_type: 'user'
	});

	const fullUrl = `${installUrl}?${params.toString()}`;

	const width = 1020;
	const height = 618;
	const left = (window.innerWidth - width) / 2;
	const top = (window.innerHeight - height) / 2;

	installationWindow.value = window.open(
		fullUrl,
		'Install GitHub App',
		`width=${width},height=${height},top=${top},left=${left}`
	);

	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}

	checkWindowInterval.value = setInterval(() => {
		if (installationWindow.value?.closed) {
			clearInterval(checkWindowInterval.value);
			checkWindowInterval.value = null;
			installationWindow.value = null;
			localStorage.removeItem('github_installation_project_id');
		}
	}, 500);
};

const handleInstallationMessage = (event) => {
	if (event.origin !== window.location.origin) return;

	if (event.data.type === 'github-auth-success') {
		toast.add({
			severity: 'success',
			summary: '성공',
			detail: 'GitHub 연동이 완료되었습니다',
			life: 3000
		});
	}
};


// Lifecycle hooks
onMounted(() => {
	githubAppStore.fetchInstallations();
	window.addEventListener('message', handleInstallationMessage);
});

onUnmounted(() => {
	window.removeEventListener('message', handleInstallationMessage);
	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}
});
</script>

<style scoped>
.p-dialog-content {
	padding: 1.5rem;
}
</style>