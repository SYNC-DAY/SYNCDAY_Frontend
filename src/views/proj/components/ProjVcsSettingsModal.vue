<template>
	<div>
		<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="Vcs Integration"
			:style="{ width: '70vw', height: '50vh' }" class="p-0"></Dialog>
		<VcsTypeMenu />
	</div>
</template>

<script setup>
import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';

const props = defineProps({
	visible: Boolean,
	projectId: Number,
	projectData: {
		type: Object,
		required: true
	}
})

const emit = defineEmits(['update:visible'])

const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);

};
</script>

<style lang="scss" scoped></style>