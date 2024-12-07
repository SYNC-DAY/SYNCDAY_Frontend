// stores/github/useGithubAuthStore.js
import { defineStore } from "pinia";
import axios from "axios";

export const useGithubAuthStore = defineStore("githubAuth", {
  state: () => ({
    // 인증 관련 상태
    accessToken: localStorage.getItem("github_token") || null,
    userInfo: JSON.parse(localStorage.getItem("github_user_info")) || null,
    isLoading: false,
    error: null,

    // OAuth 상태
    state: localStorage.getItem("github_oauth_state"),
    stateTimestamp: localStorage.getItem("github_oauth_state_timestamp"),
    authWindow: null,

    // 초기화 상태
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: state => !!state.accessToken,
    username: state => state.userInfo?.login,
    avatarUrl: state => state.userInfo?.avatar_url,
    hasError: state => !!state.error,

    // OAuth state 유효성 검사
    isStateValid: state => {
      if (!state.state || !state.stateTimestamp) return false;
      const now = Date.now();
      const stateTime = parseInt(state.stateTimestamp);
      // state는 10분간 유효
      return now - stateTime < 10 * 60 * 1000;
    },
  },

  actions: {
    // OAuth state 생성
    generateState() {
      const state = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now().toString();

      this.state = state;
      this.stateTimestamp = timestamp;

      localStorage.setItem("github_oauth_state", state);
      localStorage.setItem("github_oauth_state_timestamp", timestamp);

      return state;
    },

    // GitHub OAuth 로그인 초기화
    loginWithGithub() {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
      const scope = "read:user read:org repo admin:org";
      const state = this.generateState();

      // 현재 경로 저장 (콜백 후 리디렉션용)
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem("github_auth_redirect", currentPath);

      // GitHub OAuth 페이지로 리디렉션
      const authUrl = new URL("https://github.com/login/oauth/authorize");
      authUrl.searchParams.append("client_id", clientId);
      authUrl.searchParams.append("redirect_uri", redirectUri);
      authUrl.searchParams.append("scope", scope);
      authUrl.searchParams.append("state", state);
      // 새 창 크기 및 위치 계산
      const width = 580;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      // 새 창 열기
      this.authWindow = window.open(authUrl.toString(), "Github_Auth", `width=${width},height=${height},top=${top},left=${left}`);

      // 창 닫힘 감지
      const checkWindow = setInterval(() => {
        if (this.authWindow?.closed) {
          clearInterval(checkWindow);
          this.authWindow = null;
        }
      }, 500);
    },

    // OAuth 콜백 처리
    async handleAuthCallback(code, returnedState) {
      this.isLoading = true;
      this.error = null;

      try {
        // state 검증
        if (!this.isStateValid || returnedState !== this.state) {
          throw new Error("Invalid state parameter");
        }

        // 백엔드에 코드 전송하여 액세스 토큰 얻기
        const response = await axios.post("user/oauth2/github/access_token", {
          code: code,
          state: returnedState,
        });

        if (response.data.success) {
          const tokenData = response.data.data;
          console.log(tokenData);
          this.setAccessToken(tokenData.access_token);
          await this.fetchUserInfo();

          // state 초기화
          this.clearOAuthState();
          return true;
        } else {
          throw new Error("Failed to get access token");
        }
      } catch (error) {
        console.error("Auth error:", error);
        this.error = error.message || "Authentication failed";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // OAuth state 초기화
    clearOAuthState() {
      this.state = null;
      this.stateTimestamp = null;
      localStorage.removeItem("github_oauth_state");
      localStorage.removeItem("github_oauth_state_timestamp");
    },

    // 액세스 토큰 설정
    setAccessToken(token) {
      console.log(token);
      this.accessToken = token;
      if (token) {
        localStorage.setItem("github_token", token);
      }
    },

    // GitHub 사용자 정보 가져오기
    async fetchUserInfo() {
      if (!this.accessToken) {
        throw new Error("No access token available");
      }

      this.isLoading = true;

      try {
        const response = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) {
          throw new Error(`HttpError! status: ${response.status}`);
        }

        const userData = await response.json();
        console.log(userData);
        this.userInfo = userData;
        localStorage.setItem("github_user_info", JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error("Error fetching user info:", error);
        this.error = error.response?.data?.message || error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // GitHub 연동 해제
    async revokeAccess() {
      if (!this.accessToken) return;

      try {
        await axios.delete("user/oauth2/github/revoke");
        this.logout();
        return true;
      } catch (error) {
        console.error("Error revoking access:", error);
        throw error;
      }
    },

    // 로그아웃
    logout() {
      this.accessToken = null;
      this.userInfo = null;
      this.error = null;
      this.clearOAuthState();
      localStorage.removeItem("github_token");
      localStorage.removeItem("github_user_info");
    },

    // 에러 초기화
    clearError() {
      this.error = null;
    },

    // 초기화 상태 설정
    setInitialized() {
      this.isInitialized = true;
    },
  },
});
