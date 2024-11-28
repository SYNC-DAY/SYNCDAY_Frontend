<template>
	<div class="vcs-info" @click="openVcsProject">
		<template v-if="vcsType === 'GITHUB'">
			<div
				class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
				<img v-if="vcsMetadata?.org_avatar_url" :src="vcsMetadata.org_avatar_url" :alt="vcsMetadata.org_name"
					class="w-8 h-8 rounded-full object-cover" />
				<div class="flex flex-col min-w-0">
					<span class="text-sm font-medium truncate">
						{{ vcsMetadata?.org_name || vcsMetadata?.org_login }}
					</span>
					<span class="text-xs text-gray-600">GitHub Organization</span>
				</div>
				<i class="pi pi-external-link ml-auto text-gray-600"></i>
			</div>
		</template>
	</div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
	vcsType: {
		type: String,
		required: true,
		validator: (value) => ['GITHUB', 'GITLAB', 'BITBUCKET'].includes(value)
	},
	vcsMetadata: {
		type: Object,
		default: () => ({})
	},
	vcsProjUrl: {
		type: String,
		required: true
	}
});

const openVcsProject = () => {
	window.open(props.vcsProjUrl, '_blank', 'noopener,noreferrer');
};
</script>

<style scoped>
.vcs-info {
	max-width: 300px;
}

.vcs-info img {
	/* Prevent image stretch */
	object-fit: cover;
	min-width: 2rem;
	/* w-8 */
	min-height: 2rem;
	/* h-8 */
}

/* Ensure proper text truncation */
.truncate {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>