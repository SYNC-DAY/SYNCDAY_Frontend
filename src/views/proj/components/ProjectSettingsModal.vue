<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="프로젝트 설정"
		:style="{ width: '70vw', height: '50vh' }" class="p-0">
		<div class="settings-content">
			<!-- Step 1: Current VCS Settings -->
			<template v-if="currentVcsSettings?.vcsType === 'GITHUB' && !isChangingSettings">
				<div class="current-settings p-4">
					<h3 class="text-xl mb-3">현재 GitHub 연동 상태</h3>
					<div class="installed-org flex align-items-center gap-3 p-3 surface-100 border-round">
						<div class="org-info flex-grow-1">
							<div class="flex align-items-center gap-2">
								<i class="pi pi-github text-xl"></i>
								<span class="font-bold">{{ currentVcsSettings.orgName }}</span>
							</div>
							<div class="text-sm text-500 mt-2">
								저장소: {{ currentVcsSettings.repoName }}
							</div>
						</div>
						<Button icon="pi pi-sync" severity="secondary" text @click="startChangeSettings"
							tooltip="연동 설정 변경" />
					</div>
				</div>
			</template>

			<!-- Step 2: GitHub Auth -->
			<template v-else-if="!props.projectData.vcs_installation_id">
				<div class="flex flex-column align-items-center gap-3 p-4">
					<h3 class="text-xl">GitHub 연동</h3>
					<p class="text-gray-600">프로젝트와 GitHub을 연동하기 위해 GithubApp을 설치해주세요</p>
					<Button @click="openInstallationWindow" severity="secondary" class="github-auth-btn">
						<i class="pi pi-github mr-2"></i>
						GitHubApp 설치
					</Button>
				</div>
			</template>

			<!-- Step 3: Organization Selection -->
			<template v-else-if="!selectedOrg">
				<div class="org-section p-4">
					<h3 class="text-xl mb-3">{{
						githubAppStore.installations.get(projectData.vcs_installation_id).vcsOrgLogin }}</h3>
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

			<!-- Step 4: Repository Selection -->
			<!-- <template v-else>
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
						<DataTable v-else v-model:selection="selectedRepo" :value="repositories" selectionMode="single"
							dataKey="id" class="p-datatable-sm" :rows="10" :paginator="true">
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
			</template> -->
		</div>

		<template #footer>
			<div class="flex justify-content-end gap-2">
				<Button label="취소" @click="handleVisibilityChange(false)" text />
				<Button label="저장" @click="handleSaveSettings" :loading="saving" :disabled="!canSave"
					severity="primary" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';
import { useGithubAppStore } from '@/stores/github/useGithubAppStore';
import { useToast } from 'primevue/usetoast';
import { useGithubProjStore } from '@/stores/github/useGithubProjStore';

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
	},
	projectData: {
		type: Object,
		required: true
	}
});

const emit = defineEmits(['update:visible', 'saved']);

// Store instances
const githubAuthStore = useGithubAuthStore();
const githubProjStore = useGithubProjStore();
const githubOrgStore = useGithubOrgStore();
const githubRepoStore = useGithubRepoStore();
const githubAppStore = useGithubAppStore();
const toast = useToast();




// Component state
const isChangingSettings = ref(false);
const selectedOrg = ref(null);
const selectedRepo = ref(null);
const repositories = ref([]);
const loadingOrgs = ref(false);
const loadingRepos = ref(false);
const saving = ref(false);
const installationWindow = ref(null);
const checkWindowInterval = ref(null);

// Computed properties
const organizations = computed(() => githubOrgStore.allOrganizations || []);
const canSave = computed(() => selectedOrg.value && selectedRepo.value && !isLoading.value);
const isLoading = computed(() => loadingOrgs.value || loadingRepos.value || saving.value);

// Methods
const startChangeSettings = () => {
	isChangingSettings.value = true;
	selectedOrg.value = null;
	selectedRepo.value = null;
	repositories.value = [];
};

const openInstallationWindow = () => {
	// Save project ID for installation callback
	localStorage.setItem('github_installation_project_id', props.projectId);

	const installUrl = `https://github.com/apps/${import.meta.env.VITE_GITHUB_APP_NAME}/installations/new`;
	const callbackUrl = `${window.location.origin}/github/callback`;
	const fullUrl = `${installUrl}?callback_url=${encodeURIComponent(callbackUrl)}`;

	const width = 1020;
	const height = 618;
	const left = (window.innerWidth - width) / 2;
	const top = (window.innerHeight - height) / 2;

	installationWindow.value = window.open(
		fullUrl,
		'Install GitHub App',
		`width=${width},height=${height},top=${top},left=${left}`
	);

	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
	}

	checkWindowInterval.value = setInterval(() => {
		if (installationWindow.value?.closed) {
			clearInterval(checkWindowInterval.value);
			checkWindowInterval.value = null;
			installationWindow.value = null;
			localStorage.removeItem('github_installation_project_id');
		}
	}, 500);
};

const handleInstallationMessage = (event) => {
	if (event.origin !== window.location.origin) return;

	if (event.data.type === 'github-auth-success') {
		toast.add({
			severity: 'success',
			summary: '성공',
			detail: 'GitHub 연동이 완료되었습니다',
			life: 3000
		});
		loadOrganizations();
	}
};

const handleOrgSelect = async (org) => {
	try {
		if (!org.isInstalled) {
			openInstallationWindow();
			return;
		}

		selectedOrg.value = org;
		await loadOrgRepositories(org);
	} catch (error) {
		console.error('Organization selection failed:', error);
		toast.add({
			severity: 'error',
			summary: '오류',
			detail: '조직 선택 중 오류가 발생했습니다',
			life: 3000
		});
	}
};

const loadOrgRepositories = async (org) => {
	if (!org) return;

	loadingRepos.value = true;
	try {
		repositories.value = await githubRepoStore.fetchUserRepos(org.login);
	} catch (error) {
		console.error('Failed to load repositories:', error);
		repositories.value = [];
		toast.add({
			severity: 'error',
			summary: '오류',
			detail: '저장소 목록을 불러오는데 실패했습니다',
			life: 3000
		});
	} finally {
		loadingRepos.value = false;
	}
};

const handleChangeOrg = () => {
	selectedOrg.value = null;
	selectedRepo.value = null;
	repositories.value = [];
};

const handleSaveSettings = async () => {
	if (!canSave.value) return;

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
		toast.add({
			severity: 'success',
			summary: '성공',
			detail: 'VCS 설정이 저장되었습니다',
			life: 3000
		});
	} catch (error) {
		console.error('Failed to save VCS settings:', error);
		toast.add({
			severity: 'error',
			summary: '오류',
			detail: '설정 저장 중 오류가 발생했습니다',
			life: 3000
		});
	} finally {
		saving.value = false;
	}
};

const handleVisibilityChange = (value) => {
	if (!value) {
		resetState();
	}
	emit('update:visible', value);
};

const resetState = () => {
	isChangingSettings.value = false;
	selectedOrg.value = null;
	selectedRepo.value = null;
	repositories.value = [];
	loadingOrgs.value = false;
	loadingRepos.value = false;
	saving.value = false;
};

const cleanup = () => {
	if (checkWindowInterval.value) {
		clearInterval(checkWindowInterval.value);
		checkWindowInterval.value = null;
	}
	if (installationWindow.value) {
		installationWindow.value.close();
	}
	installationWindow.value = null;
};


// Lifecycle hooks
onMounted(() => {

	githubAppStore.fetchGithubInstallationToken(props.projectData.vcs_installation_id)
	githubProjStore.fetchProjects(props.projectData.vcs_installation_id);
	window.addEventListener('message', handleInstallationMessage);
});

onUnmounted(() => {
	window.removeEventListener('message', handleInstallationMessage);
	cleanup();
});

// Watch for current VCS settings
watch(() => props.currentVcsSettings, (newSettings) => {
	if (newSettings?.vcsType === 'GITHUB' && !isChangingSettings.value) {
		githubOrgStore.fetchOrganizations().then(() => {
			const currentOrg = githubOrgStore.allOrganizations.find(
				org => org.login === newSettings.orgName
			);
			if (currentOrg) {
				selectedOrg.value = currentOrg;
				loadOrgRepositories(currentOrg).then(() => {
					selectedRepo.value = repositories.value.find(
						repo => repo.name === newSettings.repoName
					);
				});
			}
		});
	}
}, { immediate: true });
</script>

<style scoped>
.settings-content {
	height: calc(50vh - 12rem);
	overflow-y: auto;
}

.github-auth-btn {
	background-color: #24292e;
	color: white;
}

.github-auth-btn:hover {
	background-color: #1a1e21;
}

.loading-spinner {
	width: 50px;
	height: 50px;
	margin: 2rem auto;
}

:deep(.p-dialog-header) {
	padding: 1rem 1.5rem;
}

:deep(.p-dialog-content) {
	padding: 0;
}

:deep(.p-dialog-footer) {
	padding: 1rem 1.5rem;
}

.org-card:hover {
	transform: translateY(-2px);
	transition: transform 0.2s ease;
}

.installed-org {
	transition: all 0.2s;
}

.installed-org:hover {
	background-color: var(--surface-200) !important;
}
</style>