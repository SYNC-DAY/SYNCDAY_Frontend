<template>
	<Menu ref="menuRef" :model="menuItems" :popup="true" />
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import Menu from 'primevue/menu';

const menuRef = ref();
const menuItems = ref([{
	label: "VCS Type",
	items: [{
		label: "GITHUB",
		icon: "pi pi-github",
		command: () => emit('vcs-selected', 'GITHUB')
	}]
}]);

const toggle = (event) => {
	menuRef.value?.toggle(event);
}

defineExpose({ toggle });

const emit = defineEmits(['vcs-selected']);
</script>