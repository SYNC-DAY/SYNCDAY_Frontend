<template>
	<div id="app">
	  <h1>GitHub OAuth Example</h1>
	  
	  <button v-if="!isLoggedIn" @click="loginWithGitHub">Login with GitHub</button>
  
	  <div v-if="isLoggedIn">
		<h2>Your Repositories</h2>
		<ul>
		  <li v-for="repo in repositories" :key="repo.id" @click="selectRepo(repo)">
			{{ repo.name }}
		  </li>
		</ul>
  
		<div v-if="branches.length">
		  <h3>Branches for {{ selectedRepo }}</h3>
		  <ul>
			<li v-for="branch in branches" :key="branch.name" @click="selectBranch(branch)">
			  {{ branch.name }}
			</li>
		  </ul>
		</div>
  
		<div v-if="commits.length">
		  <h3>Commits for {{ selectedBranch }} in {{ selectedRepo }}</h3>
		  <ul>
			<li v-for="commit in commits" :key="commit.sha">
			  {{ commit.commit.message }}
			</li>
		  </ul>
		</div>
	  </div>
	</div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  export default {
	name: 'App',
	setup() {
	  const isLoggedIn = ref(false);
	  const repositories = ref([]);
	  const branches = ref([]);
	  const commits = ref([]);
	  const selectedRepo = ref('');
	  const selectedBranch = ref('');
	  const accessToken = ref('');
  
	  const loginWithGitHub = () => {
		const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
		const redirectUri = 'http://localhost:5000/oauth/callback';
		window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`;
	  };
  
	  const fetchRepos = async () => {
		try {
		  const response = await axios.get('https://api.github.com/user/repos', {
			headers: { Authorization: `Bearer ${accessToken.value}` },
		  });
		  repositories.value = response.data;
		} catch (error) {
		  console.error('Error fetching repositories:', error);
		}
	  };
  
	  const fetchBranches = async (repoName) => {
		try {
		  const response = await axios.get(
			`https://api.github.com/repos/YOUR_USERNAME/${repoName}/branches`,
			{
			  headers: { Authorization: `Bearer ${accessToken.value}` },
			}
		  );
		  branches.value = response.data;
		} catch (error) {
		  console.error('Error fetching branches:', error);
		}
	  };
  
	  const fetchCommits = async (repoName, branchName) => {
		try {
		  const response = await axios.get(
			`https://api.github.com/repos/YOUR_USERNAME/${repoName}/commits?sha=${branchName}`,
			{
			  headers: { Authorization: `Bearer ${accessToken.value}` },
			}
		  );
		  commits.value = response.data;
		} catch (error) {
		  console.error('Error fetching commits:', error);
		}
	  };
  
	  const selectRepo = (repo) => {
		selectedRepo.value = repo.name;
		fetchBranches(repo.name);
	  };
  
	  const selectBranch = (branch) => {
		selectedBranch.value = branch.name;
		fetchCommits(selectedRepo.value, branch.name);
	  };
  
	  onMounted(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		
		if (code) {
		  axios
			.get(`http://localhost:5000/oauth/callback?code=${code}`)
			.then((response) => {
			  accessToken.value = response.data;
			  isLoggedIn.value = true;
			  fetchRepos();
			})
			.catch((error) => {
			  console.error('Error fetching access token:', error);
			});
		}
	  });
  
	  return {
		isLoggedIn,
		repositories,
		branches,
		commits,
		selectedRepo,
		selectedBranch,
		loginWithGitHub,
		selectRepo,
		selectBranch,
	  };
	},
  };
  </script>
  
  <style>
  #app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	margin-top: 60px;
  }
  
  button {
	padding: 10px 20px;
	margin: 10px;
	font-size: 16px;
  }
  </style>
  