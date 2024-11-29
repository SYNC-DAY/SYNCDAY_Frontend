<template>
	<Dialog :visible="isOpen" @update:visible="$emit('close')" :modal="true" :closable="true"
		header="Connect GitHub Project" class="w-full max-w-3xl">
		<GithubOrgProjectSelector @cancel="$emit('close')" @connect="handleConnect" />
	</Dialog>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import GithubOrgProjectSelector from './GithubOrgSelector.vue'
import axios from 'axios'

const props = defineProps({
	isOpen: {
		type: Boolean,
		required: true
	},
	projectId: {
		type: [String, Number],
		required: true
	}
})

const emit = defineEmits(['close', 'update:project'])

const handleConnect = async ({ organization, project }) => {
	try {
		const response = await axios.patch(`/api/projects/${props.projectId}/vcs`, {
			vcsType: 'GITHUB',
			vcsProjectUrl: project.url,
			orgName: organization.login
		})

		emit('update:project', response.data)
		emit('close')
	} catch (error) {
		console.error('Failed to connect project:', error)
		// Handle error (show toast, etc.)
	}
}
</script>