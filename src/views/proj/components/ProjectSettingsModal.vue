<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="프로젝트 설정"
		:style="{ width: '70vw', height: '50vh' }" class="p-0">

		<Tabs value="0">
			<TabList>
				<Tab value="0">프로젝트</Tab>
				<Tab value="1">멤버</Tab>
				<Tab value="2">VCS</Tab>
			</TabList>

			<TabPanels>
				<TabPanel value="0">
					<!-- Project -->
					<div class="modify-proj">
						<span>프로젝트 명 :</span> 
						<InputText id="projName" v-model="formData.projName" class="w-full"
						:class="{ 'p-invalid': errors.projName }" />

						<div class="mb-4">
							<label for="startDate" class="block mb-2">시작일 : </label>
							<Calendar id="startDate" v-model="formData.startDate" class="w-full" :showIcon="true"
								dateFormat="yy-mm-dd" />
						</div>
						<div class="mb-4">
							<label for="endDate" class="block mb-2">종료일 : </label>
							<Calendar id="endDate" v-model="formData.endDate" class="w-full" :showIcon="true"/>
						</div>
						<div class="modify-button">
							<Button label="수정" @click="handleSave"></Button>
						</div>
					</div>
				</TabPanel>
				<TabPanel value="1">
					<div class="modify-member">
						<DataTable :value="projectMembers" tableStyle="min-width: 50rem">
							<Column field="username" header="Member"></Column>
							<Column field="email" header="Email"></Column>
							<!-- <Column field="participant_status" header="Status"></Column> -->
							<Column field="participant_status" header="Status">
        						<template #body="slotProps">
									<!-- 데이터가 변경될 가능성이 있는 로직 -->
									<div v-if="slotProps.data.participation_status === 'OWNER'" class="status-item">
										<img src="@/assets/icons/crown.svg" alt="Owner Icon" class="status-icon" style="width:1.3rem; "/>
										<span>OWNER</span>
									</div>
									<div v-if="slotProps.data.participation_status === 'MEMBER'" class="status-item">
										<i class="pi pi-user" style="font-size: 0.9rem"></i>
										<span>MEMBER</span>
										<Button 
                    						v-if="isOwner"
                    						icon="pi pi-trash"
                    						class="p-button-text p-button-danger ml-2"
                    						@click="confirmRemoveMember(slotProps.data)"
                    						tooltip="Remove Member"
											style="width:1.2rem; height:1.2rem"
                						/>
									</div>
								</template>
</Column>
</DataTable>
</div>
<div class="plus-member">
	<Button icon="pi pi-plus" @click="visible1 = true" rounded aria-label="Filter"></Button>
	<Dialog :visible="visible1" @update:visible="visible1 = $event" modal header="사용자 추가" :style="{ width: '25rem' }">
		<InputText type="text" v-model="value1" placeholder="이름 입력" @input="() => searchUsers(value1)" />

		<!-- 검색 결과 목록 -->
		<ul v-if="searchResults.length" class="user-list">
			<li v-for="user in searchResults" :key="user.user_id" class="user-item">
				<span>{{ user.name }}</span>
				<!-- 사용자 추가 버튼 -->
				<Button icon="pi pi-user-plus" @click="addUserToProject(user)" class="p-button-text p-button-success" />
			</li>
		</ul>
		<p v-else-if="value1.trim() && !searchResults.length">검색 결과가 없습니다.</p>
	</Dialog>
</div>
</TabPanel>
<TabPanel value="2">
	<div class="container-row justify-right">
		<Button label="VCS" severity="secondary" @click="toggleVcsMenu"></Button>
		<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
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
			<Button label="저장" @click="handleSaveSettings" :loading="saving" :disabled="!canSave" severity="primary" />
		</div>
	</template>
	</Dialog>
	</template>

	<script setup>
	import { ref, onMounted, watch, computed } from 'vue';
	import { useRoute } from 'vue-router';
	import axios from 'axios';
	import { useAuthStore } from "@/stores/auth";
	import { useGithubAppAuthStore } from '@/stores/github/useGithubAppAuthstore';
	import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
	import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';

	import { debounce } from 'lodash';
	import Tabs from 'primevue/tabs';
	import TabList from 'primevue/tablist';
	import Tab from 'primevue/tab';
	import TabPanels from 'primevue/tabpanels';
	import TabPanel from 'primevue/tabpanel';
	import { useConfirm } from "primevue/useconfirm";
	import { useToast } from 'primevue/usetoast';
	import InputText from 'primevue/inputtext';
	import Calendar from 'primevue/calendar';
	import DataTable from 'primevue/datatable';
	import Column from 'primevue/column';
	import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';

	/* store */
	const githubAppAuth = useGithubAppAuthStore();
	const githubOrgStore = useGithubOrgStore();
	const githubRepoStore = useGithubRepoStore();
	const authStore = useAuthStore(); // 로그인된 사용자 정보
	const visible1 = ref(false);
	const value1 = ref('');

	const searchResults = ref([]);
	const searchQuery = ref('');
	const route = useRoute();

	const isOwner = computed(() => {
		return projectMembers.value.some(member =>
			member.participation_status === 'OWNER' &&
			member.user_id === authStore.user.userId
		);
	});


	/* props */
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

	const toggleVcsMenu = (event) => {
		vcsMenu.value.toggle(event);
	}

	const handleVcsSelection = async (vcsType) => {
		selectedVcs.value = vcsType;
		if (vcsType === 'GITHUB' && githubAppAuth.isInstalled) {
			await fetchOrganizations();
		}
	};

	const handleInstallApp = async () => {
		try {
			await githubAppAuth.initiateInstallation();
		} catch (err) {
			error.value = 'Failed to initiate GitHub App installation';
		}
	};
	const handleConfigureApp = () => {
		// Redirect to GitHub App configuration page
		const appName = import.meta.env.VITE_GITHUB_APP_NAME;
		window.location.href = `https://github.com/apps/${appName}/installations/new`;
	};
	const fetchOrganizations = async () => {
		if (!githubAppAuth.isInstalled) return;

		isLoading.value = true;
		error.value = null;
		try {
			const orgs = await githubOrgStore.fetchOrganizations(true);
			organizations.value = orgs;
		} catch (err) {
			console.error('Error fetching organizations:', err);
			error.value = 'Failed to fetch organizations. Please try again.';
		} finally {
			isLoading.value = false;
		}
	};

	const selectOrganization = async (org) => {
		selectedOrg.value = org;
		await fetchRepositories(org.login);
	};
	const fetchRepositories = async (orgName) => {
		isLoading.value = true;
		try {
			const repos = await githubOrgStore.fetchOrgRepositories(orgName);
			repositories.value = repos;
		} catch (err) {
			console.error('Error fetching repositories:', err);
			error.value = 'Failed to fetch repositories. Please try again.';
		} finally {
			isLoading.value = false;
		}
	};
	// Services
	const confirm = useConfirm();
	const toast = useToast();

	// State
	const formData = ref({
		projName: '',
		startDate: null,
		endDate: null,
		vcsType: null
	});

	const projectMembers = ref([]);
	const selectedUser = ref(null);
	// const userSuggestions = ref([]);
	const errors = ref({});
	const isSaving = ref(false);

	const participationOptions = [
		{ label: '소유자', value: 'OWNER' },
		{ label: '멤버', value: 'MEMBER' }
	];

	// Methods
	const startChangeSettings = () => {
		isChangingSettings.value = true;
		selectedOrg.value = null;
		selectedRepo.value = null;
		repositories.value = [];
	};

	const resetForm = () => {
		formData.value = {
			projId: props.projectData.proj_id,
			projName: props.projectData.proj_name,
			startDate: new Date(props.projectData.start_time),
			endDate: new Date(props.projectData.end_time),
			vcsType: props.projectData.vcs_type
		};
		loadProjectMembers();
	};

	const loadProjectMembers = async () => {
		try {
			const response = await axios.get(`/proj-members/projs/${props.projectId}`);
			if (response.data.success) {
				// projectMembers.value = response.data.data;
				projectMembers.value = [...response.data.data];
			}
		} catch (error) {
			console.error('Failed to load members:', error);
		}
	};

	const searchUsers = async (keyword) => {
		try {
			const sanitizedKeyword = keyword.trim();
			if (!sanitizedKeyword) {
				searchResults.value = [];
				return;
			}

			const response = await axios.get(`/user/search`, {
				params: {
					keyword: sanitizedKeyword
				}
			});

			console.log("조회된 유저들: ", response)

			if (response.data.data) {
				searchResults.value = response.data.data.filter(user => user.name.includes(sanitizedKeyword));
				//   searchResults.value = response.data.data;
			} else {
				searchResults.value = [];
			}
		} catch (error) {
			console.error('Error fetching search results:', error);
			searchResults.value = [];
		}
	};

	// debounce를 사용하여 입력이 끝난 후 300ms 후에 검색 실행
	const handleInput = debounce(() => {
		searchUsers(searchQuery.value);
	}, 300);

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
			console.error('Failed to remove member:', error);
		}
	};

	const handleSave = async () => {
		try {
			alert("프로젝트를 수정합니다!");

			isSaving.value = true;
			console.log("projectId: ", props.projectId);
			const response = await axios.put(`/projs/${props.projectId}`, {
				// id: props.projectId,
				proj_name: formData.value.projName,
				start_time: formData.value.startDate,
				end_time: formData.value.endDate,
				// vcs_type: formData.value.vcsType
			});

			if (response.data.success) {
				emit('project-updated', response.data.data);
				handleVisibilityChange(false);

				toast.add({
					severity: 'success',
					summary: '설정 저장',
					detail: '프로젝트 설정이 저장되었습니다.',
					life: 3000
				});
			}
		} catch (error) {
			console.error('Failed to save project:', error);
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
		if (props.visible) {
			resetForm();
		}

		loadProjectMembers();

	});

	watch(() => props.visible, (newValue) => {
		if (newValue) {
			resetForm();
		}
	});
</script>

	<style scoped>
	.status-item {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.status-icon {
		width: 1.5rem;
		height: 1.5rem;
		object-fit: contain;
		display: inline-block;
		vertical-align: middle;
	}

	.plus-member {
		align-items: center;
		text-align: center;
		margin-top: 5%;
	}

</style>