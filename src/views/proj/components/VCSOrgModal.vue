<template>
	<div>
		<Dialog header="Select VCS"></Dialog>
	</div>
</template>

<script setup>

import Dialog from 'primevue/dialog';

const props = defineProps({
	visible: {  // Changed from isOpen to visible
		type: Boolean,
		required: true
	},
	projectId: {
		type: [String, Number],
		required: true
	}
});

const emit = defineEmits(['update:visible', 'close', 'update:project']); // Added update:visible

// Update the watch to use visible instead of isOpen
watch(() => props.visible, async (newValue) => {
	if (newValue) {
		if (!authStore.isAuthenticated) {
			showAuthDialog.value = true;
		} else {
			showOrgDialog.value = true;
			await loadOrganizations();
		}
	} else {
		showAuthDialog.value = false;
		showOrgDialog.value = false;
	}
});

// Update the close handler
const closeAuthDialog = () => {
	showAuthDialog.value = false;
	emit('update:visible', false);
	emit('close');
};
</script>
</script>

<style scoped></style>