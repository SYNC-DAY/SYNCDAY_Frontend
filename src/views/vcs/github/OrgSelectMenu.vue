<template>
	<Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal
		header="Select GitHub Organization" :style="{ width: '50vw' }" :closable="true">
		<div class="flex flex-column gap-4">
			<div class="org-selection">
				<label class="block mb-2">Organization</label>
				<Select v-model="selectedOrg" :options="orgItems()" optionLabel="label"
					placeholder="Select an organization" class="w-full" :loading="orgStore.loading" :filter="true"
					:filterMatchMode="'contains'" :filterFields="['searchTerms']" @change="handleOrgChange">
					<template #value="slotProps">
						<div v-if="slotProps.value" class="flex items-center">
							<img :src="slotProps.value.image" :alt="slotProps.value.label" class="mr-2 rounded-full"
								style="width: 1rem; height: 1rem" />
							<div>{{ slotProps.value.label }}</div>
						</div>
						<span v-else>
							{{ slotProps.placeholder }}
						</span>
					</template>
					<template #option="slotProps">
						<div class="flex items-center">
							<img :src="slotProps.option.image" :alt="slotProps.option.label" class="mr-2 rounded-full"
								style="width: 1rem; height: 1rem" />
							<div>{{ slotProps.option.label }}</div>
						</div>
					</template>
				</Select>
			</div>
		</div>

		<template #footer>
			<div class="flex justify-end gap-2">
				<Button label="Cancel" icon="pi pi-times" @click="closeDialog" class="p-button-text" />
				<Button label="Next" icon="pi pi-arrow-right" @click="handleSubmit" :disabled="!selectedOrg" />
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';

const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	}
});

const emit = defineEmits(['update:visible', 'select']);

// Store
const orgStore = useGithubOrgStore();

// State
const selectedOrg = ref(null);

// Methods
const orgItems = () => {
	// Convert object to array if needed, otherwise use the array directly
	const orgsArray = Array.isArray(orgStore.organizations)
		? orgStore.organizations
		: Object.values(orgStore.organizations);

	return orgsArray.map(org => ({
		label: org.login,
		value: org.login,
		image: org.avatar_url,
		searchTerms: `${org.login} ${org.description || ''}`.toLowerCase()
	}));
};

const handleOrgChange = () => {
	// Add any additional logic needed when organization changes
};

const closeDialog = () => {
	emit('update:visible', false);
	selectedOrg.value = null;
};

const handleSubmit = () => {
	if (selectedOrg.value) {
		const orgsArray = Array.isArray(orgStore.organizations)
			? orgStore.organizations
			: Object.values(orgStore.organizations);

		const originalOrg = orgsArray.find(org => org.login === selectedOrg.value.value);
		emit('select', {
			organization: originalOrg
		});
		closeDialog();
	}
};
// Fetch organizations when dialog opens
watch(() => props.visible, async (newValue) => {
	if (newValue) {
		await orgStore.fetchOrganizations();
	} else {
		selectedOrg.value = null;
	}
});
</script>

<style scoped>
.org-selection {
	width: 100%;
}
</style>