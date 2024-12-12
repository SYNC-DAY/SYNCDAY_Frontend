<template>
	<div class="github-callback">
		<ProgressSpinner v-if="loading" />
		<div
			v-else-if="error"
			class="error">
			{{ error }}
		</div>
	</div>
</template>

<script setup>
	import { onMounted, ref } from "vue";
	import { useGithubAuthStore } from "@/stores/github/useGithubAuthStore";
	import { useGithubAppStore } from "@/stores/github/useGithubAppStore";

	const loading = ref(true);
	const error = ref(null);
	const githubAuthStore = useGithubAuthStore();
	const githubAppStore = useGithubAppStore();

	onMounted(async () => {
		console.log("Fsdfs");
		try {
			const urlParams = new URLSearchParams(window.location.search);
			const code = urlParams.get("code");
			const state = urlParams.get("state");
			const installationId = urlParams.get("installation_id");
			const setupAction = urlParams.get("setup_action");

			console.log(`urlParams :${urlParams}`);
			if (installationId && setupAction) {
				console.log("handle Installation Callback");
				await handleInstallationCallback(installationId, setupAction);
			} else {
				throw new Error("Invalid callback parameters");
			}
		} catch (err) {
			error.value = err.message;
			notifyOpener("error", err.message);
		} finally {
			loading.value = false;
			setTimeout(() => window.close(), 1000);
		}
	});
	const handleOAuthCallback = async (code, state) => {
		try {
			// state 유효성 검증에 store의 getter 사용
			if (!githubAuthStore.isStateValid) {
				throw new Error("State validation failed");
			}
			if (state !== githubAuthStore.state) {
				throw new Error("State mismatch");
			}

			// 리다이렉트 URL 가져오기
			const redirectUrl = localStorage.getItem("github_auth_redirect");

			// OAuth 처리
			await githubAuthStore.handleAuthCallback(code, state);

			// 성공 알림
			notifyOpener("auth-success", {
				redirect: redirectUrl,
			});
		} catch (error) {
			console.error("OAuth callback error:", error);
			throw new Error("Failed to process OAuth callback");
		}
	};

	const handleInstallationCallback = async (installationId, setupAction) => {
		await githubAppStore.handleInstallationCallback(installationId, setupAction);
		localStorage.removeItem("github_installation_project_id");
		notifyOpener("installation-success", { installationId });
	};

	const notifyOpener = (type, data = null) => {
		if (window.opener) {
			const message = {
				type: `github-${type}`,
				data: data,
			};
			window.opener.postMessage(message, window.location.origin);
			window.close();
		}
	};
</script>

<style scoped>
	.github-callback {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}

	.error {
		color: red;
		text-align: center;
	}
</style>
