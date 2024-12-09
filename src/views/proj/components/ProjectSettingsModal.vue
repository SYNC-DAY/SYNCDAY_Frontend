<template>
	<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="프로젝트 설정"
		:style="{ width: '70vw', height: '50vh' }" class="p-0">

		<Tabs value="0">
			<TabList>
				<Tab value="0">프로젝트</Tab>
				<Tab value="1">멤버</Tab>
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
							<Calendar id="endDate" v-model="formData.endDate" class="w-full" :showIcon="true" />
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
										<img  alt="Owner Icon" class="status-icon"
											style="width:1.3rem; " />
										<span>OWNER</span>
									</div>
									<div v-if="slotProps.data.participation_status === 'MEMBER'" class="status-item">
										<i class="pi pi-user" style="font-size: 0.9rem"></i>
										<span>MEMBER</span>
										<Button v-if="isOwner" icon="pi pi-trash"
											class="p-button-text p-button-danger ml-2"
											@click="confirmRemoveMember(slotProps.data)" tooltip="Remove Member"
											style="width:1.2rem; height:1.2rem" />
									</div>
								</template>
							</Column>
						</DataTable>
					</div>
					<div class="plus-member">
						<Button icon="pi pi-plus" @click="visible1 = true" rounded aria-label="Filter"></Button>
						<Dialog 
        					:visible="visible1" 
        					@update:visible="visible1 = $event" 
        					modal 
        					header="사용자 추가" 
        					:style="{ width: '25rem' }"
    					>
						<InputText type="text" v-model="value1" placeholder="이름 입력" @input="() => searchUsers(value1)"/>
						
						<!-- 검색 결과 목록 -->
						<ul v-if="searchResults.length" class="user-list">
							<li v-for="user in searchResults" :key="user.user_id" class="user-item">
							<span>{{ user.name }}</span>
							<!-- 사용자 추가 버튼 -->
							<Button 
								icon="pi pi-user-plus" 
								@click="addMember(user)" 
								class="p-button-text p-button-success"
							/>
							</li>
						</ul>
						<p v-else-if="value1.trim() && !searchResults.length">검색 결과가 없습니다.</p>
    					</Dialog>
					</div>
				</TabPanel>
			</TabPanels>
		</Tabs>

		<template #footer>

		</template>
	</Dialog>

</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";


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

/* store */

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

const isLoading = ref(false);
const error = ref(null);

const organizations = ref([]);
const repositories = ref([]);


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

const addMember = async (selectedUser) => {
  try {
    if (!selectedUser || !selectedUser.userId) {
      throw new Error("선택된 사용자가 유효하지 않습니다.");
    }

    const requestData = {
      userId: selectedUser.userId,
      participation_status: "MEMBER", // 본문에 데이터 포함
    };

    const response = await axios.post(`/proj-members/${props.projectId}/members`, requestData);

    console.log("추가된 유저 ID: ", selectedUser.userId);

    if (response.data.success) {
      toast.add({
        severity: "success",
        summary: "멤버 추가",
        detail: "멤버가 성공적으로 추가되었습니다.",
        life: 3000,
      });
    }
  } catch (error) {
    console.error("Failed to add member:", error);
    toast.add({
      severity: "error",
      summary: "멤버 추가 실패",
      detail: "멤버 추가 중 오류가 발생했습니다.",
      life: 3000,
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