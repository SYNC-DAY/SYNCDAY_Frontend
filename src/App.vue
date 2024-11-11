<!-- App.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const isAuthenticated = ref(false)
const userProfile = ref(null)
const error = ref(null)

// Replace these with your GitHub OAuth App credentials
const GITHUB_CLIENT_ID = 'your_client_id'
const REDIRECT_URI = 'http://localhost:5173/callback'
const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user`

const handleLogin = () => {
  window.location.href = GITHUB_OAUTH_URL
}

const handleOAuthCallback = async (code) => {
  try {
    // Your backend endpoint that handles the OAuth code exchange
    const response = await axios.post('http://localhost:3000/auth/github', { code })
    const { access_token } = response.data
    
    // Store the token
    localStorage.setItem('github_token', access_token)
    
    // Fetch user profile
    await fetchUserProfile(access_token)
    isAuthenticated.value = true
  } catch (err) {
    error.value = 'Authentication failed'
    console.error('Auth error:', err)
  }
}

const fetchUserProfile = async (token) => {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    userProfile.value = response.data
  } catch (err) {
    error.value = 'Failed to fetch user profile'
    console.error('Profile fetch error:', err)
  }
}

const handleLogout = () => {
  localStorage.removeItem('github_token')
  isAuthenticated.value = false
  userProfile.value = null
}

onMounted(() => {
  // Check if we're handling a callback
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  
  if (code) {
    handleOAuthCallback(code)
  }
  
  // Check if user is already authenticated
  const token = localStorage.getItem('github_token')
  if (token) {
    isAuthenticated.value = true
    fetchUserProfile(token)
  }
})
</script>

<template>
  <div class="container">
    <header>
      <h1>GitHub OAuth Demo</h1>
    </header>

    <main>
      <div v-if="error" class="error">
        {{ error }}
      </div>

      <div v-if="!isAuthenticated" class="login-container">
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
    </main>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 2rem;
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
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #2c974b;
}

.profile-container {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

.profile {
  text-align: center;
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
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #cb2431;
}

.error {
  background-color: #ffebe9;
  border: 1px solid #ff8182;
  color: #cf222e;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}
</style>