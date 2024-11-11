
<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { storeToRefs } from 'pinia'
import config from '@/config/env'

const authStore = useAuthStore()
const { isAuthenticated, userProfile, loading, error } = storeToRefs(authStore)

const handleLogin = () => {
  window.location.href = config.github.oauthUrl
}

const handleLogout = () => {
  authStore.clearAuth()
}

watch(() => authStore.githubCode, (newCode) => {
  if (newCode) {
    authStore.fetchAccessToken()
  }
})

watch(() => authStore.accessToken, (newToken) => {
  if (newToken) {
    authStore.fetchUserProfile()
  }
})

onMounted(() => {
  console.log(config.github.oauthUrl)

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    authStore.setGithubCode(code)
  } else {
    authStore.initializeAuth()
  }
})
</script>



<template>
  <div class="container">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">
      Loading...
    </div>

    <div v-else-if="!isAuthenticated" class="login-container">
      <button @click="handleLogin" class="login-button">
        Login with GitHub
      </button>
    </div>

    <div v-else class="profile-container">
      <div v-if="userProfile" class="profile">
        <img :src="userProfile.avatar_url" :alt="userProfile.login" class="avatar">
        <h2>{{ userProfile.name }}</h2>
        <p>{{ userProfile.login }}</p>
        <p>{{ userProfile.bio }}</p>
        <button @click="handleLogout" class="logout-button">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.error-message {
  background-color: #ffebe9;
  border: 1px solid #ff8182;
  color: #cf222e;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.login-container {
  text-align: center;
  padding: 2rem;
}

.login-button {
  background-color: #2da44e;
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.profile-container {
  text-align: center;
  padding: 2rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 1rem;
}

.logout-button {
  background-color: #d73a49;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  margin-top: 1rem;
  cursor: pointer;
}
</style>