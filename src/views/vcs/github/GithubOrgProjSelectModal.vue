<template>


	<Dialog :visible="visible" modal :style="{ width: '25rem' }">
		<template #header>
			<div class="container-row vcs-integration-header">
				<i class="pi pi-github"></i>
				<span>Github Integration</span>
			</div>
		</template>

		<CascadeSelect v-model="selectedOrg" :options="orgs" optionLabel="cname" optionGroupLabel="name"
			:optionGroupChildren="['projs']" class="w-full" placeholder="select your Organization" />
	</Dialog>

</template>

<script setup>
import CascadeSelect from 'primevue/cascadeselect';

import Dialog from 'primevue/dialog';

const props = defineProps({
	visible: {
		type: Boolean,
		required: true
	}
})

const emit = defineEmits(['update:visible'])
</script>

<style scoped>
.vcs-integration-header {
	gap: 1rem;
}

.vcs-integration-header i {
	font-size: 1.5rem
}
</style>