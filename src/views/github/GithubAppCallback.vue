<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGithubAppStore } from '@/stores/useGithubAppstore';

const route = useRoute();
const router = useRouter();
const githubAppStore = useGithubAppStore();

onMounted(async () => {
	const installationId = route.query.installation_id;
	if (installationId) {
		try {
			await githubAppStore.handleInstallation(installationId);
			router.push('/github/org');
		} catch (error) {
			console.error('Installation error:', error);
		}
	}
});
</script>