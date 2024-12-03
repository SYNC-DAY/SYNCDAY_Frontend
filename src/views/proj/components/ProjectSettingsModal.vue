<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="프로젝트 설정"
		:style="{ width: '70vw', height: '50vh' }" class="p-0">
		<div class="settings-content">
			<!-- Auth Check Step -->
			<template v-if="!selectedOrg">
				<div class="flex flex-column align-items-center gap-3 p-4">
					<h3 class="text-xl">Github Organization 연동</h3>
					<p class="text-gray-600">GitHub 연동을 위해 SyncDayApp을 설치해주세요</p>
					<Button @click="openInstallationWindow" severity="secondary" class="github-auth-btn">
						<i class="pi pi-github mr-2"></i>
						GitHub으로 로그인
					</Button>
				</div>
			</template>

			<!-- Organization Selection Step -->
			<template v-else-if="!selectedOrg">
				<div class="org-section p-4">
					<h3 class="text-xl mb-3">조직 선택</h3>
					<ProgressSpinner v-if="loadingOrgs" class="loading-spinner" />
					<div v-else class="grid">
						<div v-for="org in organizations" :key="org.login" class="col-12 md:col-6 lg:col-4">
							<div class="org-card p-3 border-1 surface-border border-round cursor-pointer hover:surface-100"
								@click="handleOrgSelect(org)">
								<div class="flex align-items-center gap-3">
									<Avatar :image="org.avatar_url" shape="square" size="large" />
									<div class="flex flex-column">
										<span class="font-bold">{{ org.login }}</span>
										<Tag v-if="!org.isInstalled" severity="warning" value="설치 필요" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>

			<!-- Repository Selection Step -->
			<template v-else>
				<div class="p-4">
					<div class="selected-org flex align-items-center gap-3 p-3 surface-100 border-round mb-4">
						<Avatar :image="selectedOrg.avatar_url" shape="square" />
						<span class="font-bold">{{ selectedOrg.login }}</span>
						<Button @click="handleChangeOrg" link class="ml-auto">
							변경
						</Button>
					</div>

					<div class="repo-section">
						<h3 class="text-xl mb-3">저장소 선택</h3>
						<ProgressSpinner v-if="loadingRepos" class="loading-spinner" />
						<div v-else class="repo-list">
							<DataTable v-model:selection="selectedRepo" :value="repositories" selectionMode="single"
								dataKey="id" class="p-datatable-sm">
								<Column field="name" header="저장소명">
									<template #body="slotProps">
										<div class="flex align-items-center gap-2">
											<i class="pi pi-code text-primary"></i>
											<span>{{ slotProps.data.name }}</span>
										</div>
									</template>
								</Column>
								<Column field="private" header="공개 여부">
									<template #body="slotProps">
										<Tag :severity="slotProps.data.private ? 'danger' : 'success'"
											:value="slotProps.data.private ? 'Private' : 'Public'" />
									</template>
								</Column>
							</DataTable>
						</div>
					</div>
				</div>
			</template>
		</div>

		<template #footer>
			<div class="flex justify-content-end gap-2">
				<Button label="취소" @click="handleVisibilityChange(false)" text />
				<Button label="저장" @click="handleSaveSettings" :loading="saving" :disabled="!selectedRepo"
					severity="primary" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	},
	projectId: {
		type: String,
		required: true
	},
	currentVcsSettings: {
		type: Object,
		default: () => ({})
	}
});

const emit = defineEmits(['update:visible', 'saved']);

// Store instances
const githubAuthStore = useGithubAuthStore();
const githubOrgStore = useGithubOrgStore();
const githubRepoStore = useGithubRepoStore();
const githubAppStore = useGithubAppStore();
// Component state
const selectedOrg = ref(null);
const selectedRepo = ref(null);
const repositories = ref([]);
const loadingOrgs = ref(false);
const loadingRepos = ref(false);
const saving = ref(false);

// Computed properties
const organizations = computed(() => githubOrgStore.allOrganizations || []);

// Methods
const handleVisibilityChange = (value) => {
	emit('update:visible', value);
};

const installGithubApp = () => {
	githubAppStore.openInstallationWindow();
};

const installationWindow = ref(null);
const checkWindowInterval = ref(null);

const openInstallationWindow = () => {
	const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
	const callbackUrl = `${window.location.origin}/github/callback`;
	const fullUrl = `${installUrl}?callback_url=${encodeURIComponent(callbackUrl)}`;

	const width = 1020;
	const height = 618;
	const left = (window.innerWidth - width) / 2;
	const top = (window.innerHeight - height) / 2;

	// Open new window
	installationWindow.value = window.open(
		fullUrl,
		'Install GitHub App',
		`width=${width},height=${height},top=${top},left=${left}`
	);

	// Clear any existing interval
	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}

	// Start new interval to check window status
	checkWindowInterval.value = setInterval(() => {
		if (installationWindow.value?.closed) {
			clearInterval(checkWindowInterval.value);
			checkWindowInterval.value = null;
			installationWindow.value = null;
		}
	}, 500);
};

const handleInstallationMessage = async (event) => {
	if (event.origin !== window.location.origin) return;

	if (event.data.type === 'github-installation-complete' && event.data.data?.installationId) {
		try {
			await githubAppStore.handleInstallationCallback(event.data.data.installationId);
			// Handle successful installation
		} catch (error) {
			console.error('Failed to handle installation:', error);
			// Handle error
		} finally {
			// Cleanup
			if (checkWindowInterval.value) {
				clearInterval(checkWindowInterval.value);
				checkWindowInterval.value = null;
			}
			installationWindow.value = null;
		}
	}
};

// Setup message listener
window.addEventListener('message', handleInstallationMessage);

// Cleanup on component unmount
onUnmounted(() => {
	window.removeEventListener('message', handleInstallationMessage);
	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}
	installationWindow.value = null;
});
const handleChangeOrg = () => {
	selectedOrg.value = null;
	selectedRepo.value = null;
	repositories.value = [];
};

const handleOrgSelect = async (org) => {
	if (!org.isInstalled) {
		await githubOrgStore.initializeApp(org.login);
		return;
	}

	selectedOrg.value = org;
	await loadOrgRepositories(org);
};

const loadOrgRepositories = async (org) => {
	if (!org) return;

	loadingRepos.value = true;
	try {
		repositories.value = await githubRepoStore.fetchUserRepos(org.login);
	} catch (error) {
		console.error('Failed to load repositories:', error);
		repositories.value = [];
	} finally {
		loadingRepos.value = false;
	}
};

const handleSaveSettings = async () => {
	if (!selectedOrg.value || !selectedRepo.value) return;

	saving.value = true;
	try {
		const vcsSettings = {
			vcsType: 'GITHUB',
			orgName: selectedOrg.value.login,
			repoName: selectedRepo.value.name,
			repoUrl: selectedRepo.value.html_url
		};

		emit('saved', vcsSettings);
		handleVisibilityChange(false);
	} catch (error) {
		console.error('Failed to save VCS settings:', error);
	} finally {
		saving.value = false;
	}
};

// Lifecycle hooks

</script>

<style scoped>
.github-auth-btn {
	background-color: #24292e;
}

.github-auth-btn:hover {
	background-color: #1a1e21;
}

.loading-spinner {
	width: 50px;
	height: 50px;
	margin: 2rem auto;
}

.settings-content {
	height: calc(50vh - 12rem);
	overflow-y: auto;
}

/* PrimeVue Dialog customization */
:deep(.p-dialog-header) {
	padding: 1rem 1.5rem;
}

:deep(.p-dialog-content) {
	padding: 0;
}

:deep(.p-dialog-footer) {
	padding: 1rem 1.5rem;
}
</style>