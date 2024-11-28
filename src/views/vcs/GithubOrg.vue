<template>
	<div class="github-org-container">
		<!-- Error Display -->
		<div v-if="orgStore.hasError" class="error-alert">
			<div class="error-content">
				<span>{{ orgStore.error }}</span>
				<button @click="orgStore.clearError" class="error-dismiss">×</button>
			</div>
		</div>

		<!-- Loading State -->
		<div v-if="orgStore.isLoading" class="loading-spinner">
			<div class="spinner"></div>
			<span>Loading organizations...</span>
		</div>

		<!-- Organizations List -->
		<div v-if="orgStore.allOrganizations.length" class="orgs-section">
			<h2>Your Organizations</h2>
			<div class="orgs-grid">
				<div v-for="org in orgStore.allOrganizations" :key="org.id" class="org-card"
					:class="{ active: orgStore.currentOrg?.id === org.id }" @click="handleOrgSelect(org)">
					<img :src="org.avatar_url" :alt="org.login" class="org-avatar">
					<div class="org-info">
						<h3>{{ org.name || org.login }}</h3>
						<p class="org-description">{{ org.description || 'No description' }}</p>
						<div class="org-meta">
							<span class="org-role">Role: {{ org.membershipRole }}</span>
							<span class="org-location" v-if="org.location">
								📍 {{ org.location }}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Selected Organization Details -->
		<div v-if="orgStore.currentOrg" class="org-details">
			<h2>{{ orgStore.currentOrg.name || orgStore.currentOrg.login }}</h2>

			<!-- Repository List -->
			<div class="repositories-section" v-if="repositories.length">
				<h3>Repositories</h3>
				<div class="repo-list">
					<div v-for="repo in repositories" :key="repo.id" class="repo-item">
						<div class="repo-header">
							<h4>{{ repo.name }}</h4>
							<span class="repo-visibility">{{ repo.visibility }}</span>
						</div>
						<p class="repo-description">{{ repo.description || 'No description' }}</p>
						<div class="repo-meta">
							<span>⭐ {{ repo.stargazers_count }}</span>
							<span>🔄 {{ repo.forks_count }}</span>
							<span>📅 Updated: {{ formatDate(repo.updated_at) }}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Members List -->
			<div class="members-section" v-if="members.length">
				<h3>Members</h3>
				<div class="members-grid">
					<div v-for="member in members" :key="member.id" class="member-card">
						<img :src="member.avatar_url" :alt="member.login" class="member-avatar">
						<span class="member-name">{{ member.login }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- No Organizations Message -->
		<div v-if="!orgStore.isLoading && !orgStore.allOrganizations.length" class="no-orgs">
			<p>You don't belong to any organizations.</p>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGithubOrgStore } from '@/stores/github/useGithubOrgStore'

const orgStore = useGithubOrgStore()
const repositories = ref([])
const members = ref([])

// Methods
const fetchOrganizations = async () => {
	try {
		await orgStore.fetchOrganizations()
	} catch (error) {
		console.error('Failed to fetch organizations:', error)
	}
}

const handleOrgSelect = async (org) => {
	orgStore.setSelectedOrg(org)
	await Promise.all([
		fetchOrgRepositories(org.login),
		fetchOrgMembers(org.login)
	])
}

const fetchOrgRepositories = async (orgName) => {
	try {
		repositories.value = await orgStore.fetchOrgRepositories(orgName)
	} catch (error) {
		console.error('Failed to fetch repositories:', error)
	}
}

const fetchOrgMembers = async (orgName) => {
	try {
		members.value = await orgStore.fetchOrgMembers(orgName)
	} catch (error) {
		console.error('Failed to fetch members:', error)
	}
}

const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	})
}

// Watchers
watch(() => orgStore.currentOrg, async (newOrg) => {
	if (newOrg) {
		await handleOrgSelect(newOrg)
	} else {
		repositories.value = []
		members.value = []
	}
})

// Lifecycle hooks
onMounted(fetchOrganizations)
</script>

<style scoped>
.github-org-container {
	padding: 20px;
	max-width: 1200px;
	margin: 0 auto;
}

.error-alert {
	background-color: #fee2e2;
	border: 1px solid #ef4444;
	border-radius: 6px;
	padding: 12px;
	margin-bottom: 20px;
}

.error-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.loading-spinner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 40px;
}

.orgs-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 20px;
	margin-top: 20px;
}

.org-card {
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 8px;
	padding: 16px;
	cursor: pointer;
	transition: all 0.2s;
}

.org-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.org-card.active {
	border-color: #3b82f6;
	background-color: #eff6ff;
}

.org-avatar {
	width: 64px;
	height: 64px;
	border-radius: 8px;
	margin-bottom: 12px;
}

.org-info {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.org-meta {
	display: flex;
	gap: 12px;
	font-size: 0.875rem;
	color: #6b7280;
}

.repositories-section,
.members-section {
	margin-top: 32px;
}

.repo-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-top: 16px;
}

.repo-item {
	background-color: white;
	border: 1px solid #e5e7eb;
	border-radius: 6px;
	padding: 16px;
}

.repo-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}

.repo-visibility {
	background-color: #f3f4f6;
	padding: 2px 8px;
	border-radius: 12px;
	font-size: 0.75rem;
	color: #4b5563;
}

.repo-meta {
	display: flex;
	gap: 16px;
	margin-top: 12px;
	font-size: 0.875rem;
	color: #6b7280;
}

.members-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	gap: 16px;
	margin-top: 16px;
}

.member-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8px;
}

.member-avatar {
	width: 48px;
	height: 48px;
	border-radius: 50%;
}

.member-name {
	font-size: 0.875rem;
	color: #374151;
}

.no-orgs {
	text-align: center;
	padding: 40px;
	color: #6b7280;
}
</style>