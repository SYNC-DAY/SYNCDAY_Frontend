<template>
	<div>
		<Dialog :visible="visible" @update:visible="handleVisibilityChange" modal header="VCS Integration"
			:style="{ width: '70vw', height: '50vh' }" class="p-0">
			<div class="container-row justify-right">
				<Button label="VCS Type" severity="secondary" @click="toggleVcsMenu"></Button>
				<VcsTypeMenu ref="vcsMenu" @vcs-selected="handleVcsSelection" />
			</div>


			<div v-if="selectedVcs === 'GITHUB' && !githubAuthStore.isInstalled" class="mt-4">
				<h3 class="text-lg font-medium mb-4">GitHub Integration</h3>

				<!-- Installation Status -->
				<div class="container-column gap-1rem installation-required">
					<div class="text-center py-6">
						<h4 class="text-xl font-medium mb-2">GitHub App Installation Required</h4>
						<p class="text-gray-600 mb-4">
							To connect your GitHub organizations, you need to install our GitHub App first.
						</p>
						<Button label="Install GitHub App" severity="primary" @click="handleInstallApp" />
					</div>
				</div>
			</div>
		</Dialog>

	</div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from "@/stores/auth";
import { useGithubAuthStore } from '@/stores/github/useGithubAuthStore';
import VcsTypeMenu from '@/views/vcs/components/VcsTypeMenu.vue';
import { storeToRefs } from 'pinia';

const props = defineProps({
	visible: Boolean,
	projectId: Number,
	projectData: {
		type: Object,
		required: true
	}
})



/* stores */
const authStore = useAuthStore();
const githubAuthStore = useGithubAuthStore();
/* refs */

const { user } = storeToRefs(authStore);
const vcsMenu = ref(null);
const selectedVcs = ref('GITHUB');

/* emits */
const emit = defineEmits(['update:visible'])
const handleVisibilityChange = (newValue) => {
	emit('update:visible', newValue);

};

/* handling */
const handleVcsSelection = async (vcsType) => {
	selectedVcs.value = vcsType;
	if (vcsType === 'GITHUB') {
		console.log(user.value.userId)
		githubAuthStore.checkInstallationStatus(user.value.userId)
	}
}

const toggleVcsMenu = (event) => {
	vcsMenu.value.toggle(event);

}

</script>

<style lang="scss" scoped></style>