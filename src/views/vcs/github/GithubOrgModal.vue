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
					<Button label="Try Again" severity="primary" @click="loadOrganizations" />
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

	<!-- Auth Required Dialog -->
	<Dialog v-model:visible="showAuthDialog" modal :style="{ width: '30rem' }" header="GitHub Authentication Required">
		<div class="flex flex-column align-items-center gap-4 p-4">
			<i class="pi pi-github text-4xl"></i>
			<p class="text-center m-0">
				You need to connect your GitHub account to access organization features.
			</p>
		</div>
		<template #footer>
			<div class="flex justify-content-end gap-2">
				<Button label="Cancel" severity="secondary" text @click="handleAuthClose" />
				<Button label="Connect GitHub" severity="primary" @click="handleAuthClick" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useToast } from 'primevue/usetoast';

// Props
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

// Emits
const emit = defineEmits(['update:visible', 'close', 'update:project']);

// Store and Services
const authStore = useGithubAuthStore();
const orgStore = useGithubOrgStore();
const toast = useToast();

// State
const isLoading = ref(false);
const error = ref(null);
const organizations = ref([]);
const showAuthDialog = ref(false);

// Methods
const loadOrganizations = async () => {
	try {
		isLoading.value = true;
		error.value = null;
		organizations.value = await orgStore.fetchOrganizations(true);
	} catch (err) {
		error.value = err.message;
		toast.add({
			severity: 'error',
			summary: 'Failed to Load Organizations',
			detail: err.message,
			life: 3000
		});
	} finally {
		isLoading.value = false;
	}
};

const selectOrganization = async (org) => {
	try {
		isLoading.value = true;
		const response = await fetch(`/api/projects/${props.projectId}/vcs`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
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

		toast.add({
			severity: 'success',
			summary: 'Organization Connected',
			detail: `Successfully connected to ${org.name || org.login}`,
			life: 3000
		});
	} catch (err) {
		error.value = err.message;
		toast.add({
			severity: 'error',
			summary: 'Connection Failed',
			detail: err.message,
			life: 3000
		});
	} finally {
		isLoading.value = false;
	}
};

const handleVisibilityChange = (newValue) => {
	if (!newValue) {
		handleClose();
	}
};

const handleClose = () => {
	error.value = null;
	emit('close');
};

const handleAuthClick = () => {
	showAuthDialog.value = false;
	authStore.loginWithGithub();
};

const handleAuthClose = () => {
	showAuthDialog.value = false;
	handleClose();
};

// Watchers
watch(() => props.isOpen, async (newValue) => {
	if (newValue) {
		if (!authStore.isAuthenticated) {
			showAuthDialog.value = true;
		} else {
			await loadOrganizations();
		}
	}
});

// Cleanup
onMounted(() => {
	if (props.isOpen && authStore.isAuthenticated) {
		loadOrganizations();
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