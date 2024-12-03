<script setup>
import { ref, watchEffect } from 'vue';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
	<Dialog :open="isOpen" @update:open="emit('close')">
		<DialogContent class="w-full max-w-4xl h-[80vh]">
			<div class="flex flex-col h-full">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Install GitHub App for {{ organization?.login }}</h2>
					<button class="text-gray-500 hover:text-gray-700" @click="emit('close')">
						<span class="sr-only">Close</span>
						<XIcon class="h-6 w-6" />
					</button>
				</div>

				<div class="flex-1 min-h-0">
					<iframe v-if="iframeUrl" :src="iframeUrl" class="w-full h-full border-0" allow="popup"></iframe>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</template>