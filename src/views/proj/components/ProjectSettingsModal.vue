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
					Project
				</TabPanel>
				<TabPanel value="1">
					Members
				</TabPanel>
				<TabPanel value="2">
					<div class="container-row justify-right">
						<Button label="VCS" severity="secondary" @click="toggleVcsMenu"></Button>
						<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
					</div>

					<div v-if="selectedVcs === 'GITHUB'" class="mt-4">
						<h3 class="text-lg font-medium mb-4">GitHub Integration</h3>

						<!-- Installation Status -->
						<div v-if="!githubAppAuth.isInstalled" class="installation-required">
							<div class="text-center py-6">
								<i class="pi pi-github text-4xl mb-3"></i>
								<h4 class="text-xl font-medium mb-2">GitHub App Installation Required</h4>
								<p class="text-gray-600 mb-4">
									To connect your GitHub organizations, you need to install SyncDay GitHub App first.
								</p>
								<Button label="Install GitHub App" severity="primary"
									:loading="githubAppAuth.isInstalling" @click="handleInstallApp" />
							</div>
						</div>
					</div>
				</TabPanel>


			</TabPanels>
		</Tabs>

		<template #footer>

		</template>
	</Dialog>

</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useGithubAppAuthStore } from '@/stores/github/useGithubAppAuthstore';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { useGithubRepoStore } from '@/stores/github/useGithubRepoStore';


import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';

import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';

/* store */
const githubAppAuth = useGithubAppAuthStore();
const githubOrgStore = useGithubOrgStore();
const githubRepoStore = useGithubRepoStore();


/* props */
const props = defineProps({
	visible: Boolean,
	projectId: Number,
	projectData: {
		type: Object,
		required: true
	}
});

/* emit */
const emit = defineEmits(['update:visible', 'project-updated', 'project-deleted']);

/* refs */
const vcsMenu = ref(null);
const selectedVcs = ref(null);
const selectedOrg = ref(null);
const isLoading = ref(false);
const error = ref(null);

const organizations = ref([]);
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
const userSuggestions = ref([]);
const errors = ref({});
const isSaving = ref(false);

const participationOptions = [
	{ label: '소유자', value: 'OWNER' },
	{ label: '멤버', value: 'MEMBER' }
];

// Methods
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);
	if (!newValue) {
		resetForm();
	}
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
			projectMembers.value = response.data.data;
		}
	} catch (error) {
		console.error('Failed to load members:', error);
	}
};

const searchUsers = async (event) => {
	try {
		const response = await axios.get(`/users/search?query=${event.query}`);
		userSuggestions.value = response.data.data;
	} catch (error) {
		console.error('User search failed:', error);
	}
};

const addMember = async () => {
	try {
		const response = await axios.post(`/proj-members/${props.projectId}/members`, {
			userId: selectedUser.value.user_id
		});

		if (response.data.success) {
			await loadProjectMembers();
			selectedUser.value = null;
			toast.add({
				severity: 'success',
				summary: '멤버 추가',
				detail: '멤버가 추가되었습니다.',
				life: 3000
			});
		}
	} catch (error) {
		console.error('Failed to add member:', error);
		toast.add({
			severity: 'error',
			summary: '멤버 추가 실패',
			detail: '멤버 추가 중 오류가 발생했습니다.',
			life: 3000
		});
	}
};

const updateMemberStatus = async (member) => {
	try {
		await axios.put(`/proj-members/${props.projectId}/members/${member.user_id}`, {
			participation_status: member.participation_status
		});

		toast.add({
			severity: 'success',
			summary: '권한 변경',
			detail: '멤버 권한이 변경되었습니다.',
			life: 3000
		});
	} catch (error) {
		console.error('Failed to update member status:', error);
		// Revert the change
		await loadProjectMembers();
	}
};

const confirmRemoveMember = (member) => {
	confirm.require({
		message: `${member.username}님을 프로젝트에서 제외하시겠습니까?`,
		header: '멤버 제외',
		icon: 'pi pi-exclamation-triangle',
		accept: () => removeMember(member)
	});
};

const removeMember = async (member) => {
	try {
		await axios.delete(`/proj-members/${props.projectId}/members/${member.user_id}`);
		await loadProjectMembers();

		toast.add({
			severity: 'success',
			summary: '멤버 제외',
			detail: '멤버가 제외되었습니다.',
			life: 3000
		});
	} catch (error) {
		console.error('Failed to remove member:', error);
	}
};

const handleSave = async () => {
	try {
		isSaving.value = true;

		const response = await axios.put(`/projs/${props.projectId}`, {
			proj_name: formData.value.projName,
			start_time: formData.value.startDate,
			end_time: formData.value.endDate,
			vcs_type: formData.value.vcsType
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
		isSaving.value = false;
	}
};

const confirmDeleteProject = () => {
	confirm.require({
		message: '프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
		header: '프로젝트 삭제',
		icon: 'pi pi-exclamation-triangle',
		accept: deleteProject
	});
};

const deleteProject = async () => {
	try {
		await axios.delete(`/projs/${props.projectId}`);
		emit('project-deleted', props.projectId);
		handleVisibilityChange(false);

		toast.add({
			severity: 'success',
			summary: '프로젝트 삭제',
			detail: '프로젝트가 삭제되었습니다.',
			life: 3000
		});
	} catch (error) {
		console.error('Failed to delete project:', error);
	}
};



// Lifecycle
onMounted(() => {
	if (props.visible) {
		resetForm();
	}
});

watch(() => props.visible, (newValue) => {
	if (newValue) {
		resetForm();
	}
});
</script>