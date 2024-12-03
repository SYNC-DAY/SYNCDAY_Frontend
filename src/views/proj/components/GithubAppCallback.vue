<template>
	<div>Processing installation...</div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
	// Get installation_id from URL parameters
	const params = new URLSearchParams(window.location.search);
	const installationId = params.get('installation_id');

	if (installationId) {
		// Send message to opener window
		window.opener.postMessage({
			type: 'github-installation-complete',
			installationId: installationId
		}, window.location.origin);

		// Close this window
		window.close();
	}
});
</script>