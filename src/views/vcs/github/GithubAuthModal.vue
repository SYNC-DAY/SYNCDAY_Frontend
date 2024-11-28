<template>
	<Dialog :visible="visible" @update:visible="$emit('update:visible', $event)" :modal="true" :closable="true"
		:dismissableMask="true" :style="{ width: '30rem' }" class="github-auth-modal">
		<template #header>
			<div class="flex align-items-center gap-2">
				<i class="pi pi-github text-xl"></i>
				<span class="text-xl font-semibold">Connect to GitHub</span>
			</div>
		</template>

		<div class="flex flex-column align-items-center p-4 gap-4">
			<!-- Loading State -->
			<div v-if="isLoading" class="flex flex-column align-items-center gap-3">
				<ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" fill="var(--surface-ground)"
					animationDuration=".7s" />
				<p class="text-lg text-gray-700">Connecting to GitHub...</p>
			</div>

			<!-- Error State -->
			<div v-else-if="error" class="flex flex-column align-items-center gap-3 w-full">
				<i class="pi pi-exclamation-circle text-4xl text-red-500"></i>
				<p class="text-lg text-red-600">{{ error }}</p>
				<Button label="Try Again" severity="danger" @click="handleLogin" />
			</div>

			<!-- Default State -->
			<div v-else class="flex flex-column align-items-center gap-4">
				<i class="pi pi-github text-5xl"></i>
				<div class="text-center">
					<h3 class="m-0 mb-2">Connect Your GitHub Account</h3>
					<p class="text-gray-600 m-0">
						Link your GitHub account to enable repository integration and collaboration features.
					</p>
				</div>
				<Button label="Login with GitHub" icon="pi pi-github" size="large" @click="handleLogin"
					:loading="isLoading" />
			</div>
		</div>

		<template #footer>
			<div class="flex justify-content-end gap-2">
				<Button label="Cancel" severity="secondary" text @click="handleClose" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useToast } from 'primevue/usetoast';

// Props
const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	}
});

// Emits
const emit = defineEmits([
	'update:visible',
	'login-success',
	'login-error'
]);

// Store and Services
const authStore = useGithubAuthStore();
const toast = useToast();

// State
const isLoading = ref(false);
const error = ref(null);

// Methods
const handleLogin = async () => {
	try {
		isLoading.value = true;
		error.value = null;

		// Just initiate the login - the callback component will handle the rest
		authStore.loginWithGithub();

		// No need to emit success here as the actual authentication
		// hasn't happened yet - it will happen in the callback
	} catch (err) {
		error.value = err.message || 'Failed to connect to GitHub';
		emit('login-error', err);
	} finally {
		isLoading.value = false;
	}
};

const handleClose = () => {
	error.value = null;
	emit('update:visible', false);
};

// Cleanup on unmount
onUnmounted(() => {
	error.value = null;
	isLoading.value = false;
});
</script>

<style scoped>
.github-auth-modal {
	:deep(.p-dialog-header) {
		padding: 1.5rem;
	}

	:deep(.p-dialog-content) {
		padding: 0;
	}

	:deep(.p-dialog-footer) {
		padding: 1.5rem;
	}
}

.pi-github {
	color: #24292e;
}
</style>