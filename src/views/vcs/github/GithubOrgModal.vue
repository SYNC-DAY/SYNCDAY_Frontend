<template>
	<Dialog :visible="isOpen" @update:visible="handleVisibilityChange" modal :style="{ width: '40rem' }"
		:dismissableMask="true">
		<template #header>
			<div class="flex align-items-center gap-2">
				<i class="pi pi-building text-xl"></i>
				<span class="text-xl font-semibold">Select GitHub Organization</span>
			</div>
		</template>

		<!-- Main Content -->
		<div class="org-modal-content p-4">
			<!-- Loading State -->
			<div v-if="isLoading" class="flex flex-column align-items-center gap-3 py-6">
				<ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" fill="var(--surface-ground)" />
				<p class="text-lg text-gray-700">Loading organizations...</p>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="surface-card p-4 border-round">
				<Message severity="error" :closable="false" class="mb-4">
					<div class="flex align-items-center gap-2">
						<i class="pi pi-exclamation-circle"></i>
						<span>{{ error }}</span>
					</div>
				</Message>
				<div class="flex justify-content-end">
					<Button label="Try Again" severity="primary" @click="retryOperation" />
				</div>
			</div>

			<!-- Organizations List -->
			<div v-else-if="organizations.length" class="org-list">
				<div v-for="org in organizations" :key="org.id"
					class="org-item surface-ground border-round p-3 mb-2 cursor-pointer hover:surface-hover"
					@click="selectOrganization(org)">
					<div class="flex align-items-center gap-3">
						<img :src="org.avatar_url" :alt="org.login" class="org-avatar" />
						<div class="flex-1">
							<h3 class="m-0 text-lg">{{ org.name || org.login }}</h3>
							<p class="text-sm text-color-secondary m-0">
								{{ org.description || 'No description available' }}
							</p>
						</div>
						<i class="pi pi-chevron-right text-color-secondary"></i>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-else class="flex flex-column align-items-center gap-3 py-6">
				<i class="pi pi-info-circle text-4xl text-color-secondary"></i>
				<p class="text-lg text-color-secondary">No organizations found</p>
			</div>
		</div>

		<!-- Footer -->
		<template #footer>
			<div class="flex justify-content-end gap-2">
				<Button label="Cancel" severity="secondary" text @click="handleClose" />
			</div>
		</template>
	</Dialog>

	<!-- Auth Modal -->
	<GithubAuthModal :visible="showAuthModal" @update:visible="handleAuthModalVisibility"
		@login-success="handleLoginSuccess" @login-error="handleLoginError" />
</template>

<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import GithubAuthModal from './GithubAuthModal.vue';

// Props and Emits
const props = defineProps({
	isOpen: {
		type: Boolean,
		required: true,
	},
	projectId: {
		type: [String, Number],
		required: true,
	}
});

const emit = defineEmits(['update:visible', 'close', 'update:project']);

// Stores
const authStore = useGithubAuthStore();
const orgStore = useGithubOrgStore();

// State
const isLoading = ref(false);
const error = ref(null);
const organizations = ref([]);
const showAuthModal = ref(false);
const pendingOperation = ref(null);

// Methods
const loadOrganizations = async () => {
	if (!authStore.isAuthenticated) {
		showAuthModal.value = true;
		pendingOperation.value = 'load';
		return;
	}

	try {
		isLoading.value = true;
		error.value = null;
		organizations.value = await orgStore.fetchOrganizations(true);
	} catch (err) {
		error.value = err.message;
	} finally {
		isLoading.value = false;
	}
};

const selectOrganization = async (org) => {
	if (!authStore.isAuthenticated) {
		showAuthModal.value = true;
		pendingOperation.value = 'select';
		return;
	}

	try {
		isLoading.value = true;
		const response = await fetch(`/api/projects/${props.projectId}/vcs`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${authStore.accessToken}`
			},
			body: JSON.stringify({
				vcs_type: 'GITHUB',
				vcs_org_url: `https://github.com/${org.login}`,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to update project VCS info');
		}

		const updatedProject = await response.json();
		emit('update:project', updatedProject);
		handleClose();
	} catch (err) {
		error.value = err.message;
	} finally {
		isLoading.value = false;
	}
};

const handleLoginSuccess = async () => {
	showAuthModal.value = false;
	if (pendingOperation.value === 'load') {
		await loadOrganizations();
	} else if (pendingOperation.value === 'select') {
		// Retry the select operation
		await loadOrganizations(); // First load orgs
		// User will need to select org again
	}
	pendingOperation.value = null;
};

const handleLoginError = (error) => {
	showAuthModal.value = false;
	error.value = error.message;
	pendingOperation.value = null;
};

const handleAuthModalVisibility = (visible) => {
	showAuthModal.value = visible;
	if (!visible) {
		pendingOperation.value = null;
	}
};

const retryOperation = async () => {
	error.value = null;
	await loadOrganizations();
};

const handleVisibilityChange = (newValue) => {
	if (!newValue) {
		handleClose();
	}
};

const handleClose = () => {
	error.value = null;
	pendingOperation.value = null;
	emit('close');
};

// Watchers
watch(() => props.isOpen, async (newValue) => {
	if (newValue) {
		await loadOrganizations();
	}
});
</script>

<style scoped>
.org-modal-content {
	min-height: 300px;
}

.org-avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
}

.org-item {
	transition: background-color 0.2s;
}

.org-list {
	max-height: 400px;
	overflow-y: auto;
}
</style>