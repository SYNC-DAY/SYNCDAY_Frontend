<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="프로젝트 설정"
		:style="{ width: '70vw' }" class="p-0">
		<TabView>
			<!-- Basic Info Tab -->
			<TabPanel header="기본 정보">
				<div class="space-y-4">
					<div class="field">
						<label for="projName">프로젝트 이름</label>
						<InputText id="projName" v-model="formData.projName" class="w-full"
							:class="{ 'p-invalid': errors.projName }" />
						<small class="p-error" v-if="errors.projName">{{ errors.projName }}</small>
					</div>

					<div class="field">
						<label>프로젝트 기간</label>
						<div class="flex gap-2">
							<Calendar v-model="formData.startDate" :showIcon="true" dateFormat="yy-mm-dd"
								class="w-full" />
							<Calendar v-model="formData.endDate" :showIcon="true" dateFormat="yy-mm-dd"
								:minDate="formData.startDate" class="w-full" />
						</div>
					</div>
				</div>
			</TabPanel>

			<!-- Members Tab -->
			<TabPanel header="멤버 관리">
				<div class="space-y-4">
					<!-- Member List -->
					<DataTable :value="projectMembers" class="p-datatable-sm">
						<Column field="username" header="이름">
							<template #body="{ data }">
								<div class="flex items-center gap-2">
									<Avatar :image="data.profile_photo" :alt="data.username" shape="circle"
										size="small">
										<template #image>
											{{ getInitials(data.username) }}
										</template>
									</Avatar>
									<span>{{ data.username }}</span>
								</div>
							</template>
						</Column>
						<Column field="email" header="이메일" />
						<Column field="participation_status" header="권한">
							<template #body="{ data }">
								<Dropdown v-model="data.participation_status" :options="participationOptions"
									optionLabel="label" optionValue="value" @change="updateMemberStatus(data)"
									:disabled="data.user_id === user.value.userId" />
							</template>
						</Column>
						<Column style="width: 5rem">
							<template #body="{ data }">
								<Button icon="pi pi-trash" severity="danger" text rounded
									@click="confirmRemoveMember(data)" :disabled="data.user_id === user.value.userId" />
							</template>
						</Column>
					</DataTable>

					<!-- Add Member -->
					<div class="flex gap-2">
						<AutoComplete v-model="selectedUser" :suggestions="userSuggestions" @complete="searchUsers"
							optionLabel="username" placeholder="사용자 검색" class="w-full" />
						<Button icon="pi pi-plus" @click="addMember" :disabled="!selectedUser" />
					</div>
				</div>
			</TabPanel>

			<!-- VCS Tab -->
			<TabPanel header="VCS 설정">
				<!-- Reuse parts of the previous VCS settings -->
				<div class="space-y-4">
					<div class="field">
						<label>VCS 타입</label>
						<Dropdown v-model="formData.vcsType" :options="vcsTypes" optionLabel="label" optionValue="value"
							placeholder="VCS 타입을 선택하세요" class="w-full" />
					</div>

					<!-- GitHub specific settings -->
					<div v-if="formData.vcsType === 'GITHUB'" class="space-y-4">
						<!-- ... GitHub settings from previous implementation ... -->
					</div>
				</div>
			</TabPanel>
		</TabView>

		<template #footer>
			<div class="flex justify-between">
				<Button label="프로젝트 삭제" icon="pi pi-trash" severity="danger" text @click="confirmDeleteProject" />
				<div class="flex gap-2">
					<Button label="취소" icon="pi pi-times" text @click="handleCancel" />
					<Button label="저장" icon="pi pi-check" @click="handleSave" :loading="isSaving" />
				</div>
			</div>
		</template>
	</Dialog>

	<ConfirmDialog />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional


import { useConfirm } from "primevue/useconfirm";

import { useToast } from 'primevue/usetoast';
import axios from 'axios';

const props = defineProps({
	visible: Boolean,
	projectId: Number,
	projectData: {
		type: Object,
		required: true
	}
});

const emit = defineEmits(['update:visible', 'project-updated', 'project-deleted']);

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