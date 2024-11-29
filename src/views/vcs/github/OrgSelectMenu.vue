<template>
	<div class="github-org-menu">
		<TieredMenu :model="organizations" :popup="true" ref="menu" />
		<Button @click="toggleMenu" class="org-select-button" :label="selectedOrgLabel"
			:icon="selectedOrg ? 'pi pi-building' : 'pi pi-github'" />
	</div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore';
import { storeToRefs } from 'pinia';
import TieredMenu from 'primevue/tieredmenu';
import Button from 'primevue/button';

// Store
const orgStore = useGithubOrgStore();
const { organizations, currentOrg } = storeToRefs(orgStore);

// Refs
const menu = ref(null);
const menuItems = ref([]);
const selectedOrg = ref(null);

// Computed
const selectedOrgLabel = computed(() =>
	selectedOrg.value ? selectedOrg.value.login : 'Select Organization'
);

// Methods
const toggleMenu = (event) => {
	menu.value.toggle(event);
};

const handleOrgSelect = async (org) => {
	selectedOrg.value = org;
	await orgStore.setSelectedOrg(org);
	await orgStore.fetchOrgRepositories(org.login);
	menu.value.hide();
};

const fetchMenuItems = async () => {
	try {
		await orgStore.fetchOrganizations();

		menuItems.value = organizations.value.map(org => ({
			label: org.login,
			icon: 'pi pi-building',
			command: () => handleOrgSelect(org),
			items: [
				{
					label: `Members: ${org.membershipRole}`,
					icon: 'pi pi-users'
				},
				{
					label: org.description || 'No description',
					icon: 'pi pi-info-circle'
				}
			]
		}));
	} catch (error) {
		console.error('Error fetching organizations:', error);
	}
};

// Lifecycle
onMounted(async () => {
	await fetchMenuItems();

	// Set initial selection if there's a current org
	if (currentOrg.value) {
		selectedOrg.value = currentOrg.value;
	}
});

// Watch for external org changes
watch(currentOrg, (newOrg) => {
	if (newOrg && (!selectedOrg.value || selectedOrg.value.login !== newOrg.login)) {
		selectedOrg.value = newOrg;
	}
});
</script>

<style scoped>
.github-org-menu {
	position: relative;
	display: inline-block;
}

.org-select-button {
	min-width: 200px;
	text-align: left;
}

:deep(.p-button-label) {
	flex: 1;
	text-align: left;
	margin-left: 0.5rem;
}
</style>