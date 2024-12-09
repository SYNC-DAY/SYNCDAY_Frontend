<script setup>
import { ref, watchEffect, onMounted, onUnmounted } from 'vue';

const props = defineProps({
	isOpen: {
		type: Boolean,
		required: true
	},
	organization: {
		type: Object,
		required: true
	}
});

const emit = defineEmits(['close', 'installation-complete']);

const iframeUrl = ref('');

watchEffect(() => {
	if (props.organization?.id) {
		iframeUrl.value = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new?target_type=Organization&target_id=${props.organization.id}`;
	}
});

// Handle messages from iframe
const handleMessage = (event) => {
	// Verify the origin matches GitHub's domain
	if (event.origin !== 'https://github.com') return;

	// Check if installation was successful
	if (event.data?.type === 'github-app-installation-completed') {
		emit('installation-complete', props.organization);
		emit('close');
	}
};

// Add and remove event listener
onMounted(() => {
	window.addEventListener('message', handleMessage);
});

onUnmounted(() => {
	window.removeEventListener('message', handleMessage);
});
</script>

<template>
	<Dialog :visible="isOpen" modal :style="{ width: '80vw', height: '80vh' }"
		:header="`Install GitHub App for ${organization?.login}`" :draggable="false" @hide="emit('close')">
		<div class="flex flex-col h-full">
			<div class="flex-1 min-h-0">
				<iframe v-if="iframeUrl" :src="iframeUrl" class="w-full h-full border-0" allow="popup"></iframe>
			</div>
		</div>
	</Dialog>
</template>

<style scoped>
:deep(.p-dialog-content) {
	padding: 0;
	height: calc(80vh - 4rem);
	/* Account for header height */
}
</style>