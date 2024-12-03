<!-- GithubCallback.vue -->
<template>
	<div>Processing installation...</div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
	const params = new URLSearchParams(window.location.search);
	const installationId = params.get('installation_id');

	if (installationId) {
		// Send only plain data, not reactive objects
		window.opener?.postMessage({
			type: 'github-installation-complete',
			data: {
				installationId: installationId
			}
		}, window.location.origin);

		// Close after a short delay to ensure message is sent
		setTimeout(() => window.close(), 100);
	}
});
</script>