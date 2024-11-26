// config/env.js
export const config = {
	github: {
	  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
	  redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI,
	  oauthUrl: `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_GITHUB_REDIRECT_URI}&scope=user`,
	},
	api: {
	  baseUrl: import.meta.env.VITE_API_BASE_URL,
	  endpoints: {
		githubAuth: '/auth/github',
		userProfile: '/user/profile'
	  }
	}
  }
  
  // 환경변수 유효성 검사
  function validateEnvVariables() {
	const requiredVars = [
	  'VITE_GITHUB_CLIENT_ID',
	  'VITE_GITHUB_REDIRECT_URI',
	  'VITE_API_BASE_URL'
	]
  
	for (const varName of requiredVars) {
	  if (!import.meta.env[varName]) {
		throw new Error(`Missing required environment variable: ${varName}`)
	  }
	}
  }
  
  // 개발 환경에서만 유효성 검사 실행
  if (import.meta.env.DEV) {
	validateEnvVariables()
  }
  
  export default config