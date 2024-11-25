export const useGithubBaseFetch = () => {
	const fetchGithub = async (endpoint, options = {}) => {
	  const baseUrl = 'https://api.github.com';
	  const defaultOptions = {
		headers: {
		  'Accept': 'application/vnd.github.v3+json'
		}
	  };
  
	  const response = await fetch(
		`${baseUrl}${endpoint}`, 
		{ ...defaultOptions, ...options }
	  );
  
	  if (!response.ok) {
		const error = await response.json();
		throw new Error(error.message || 'GitHub API request failed');
	  }
  
	  return response.json();
	};
  
	return { fetchGithub };
  };