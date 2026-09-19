import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";

const getHeaders = (accessToken: string) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
  };
};

export const getPullRequests = async (
  owner: string,
  repo: string,
  accessToken: string
) => {
  const response = await axios.get(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/pulls`,
    {
      headers: getHeaders(accessToken),
      params: {
        state: "all",
        per_page: 100,
        sort: "updated",
        direction: "desc",
      },
    }
  );

  return response.data.map((pr: any) => ({
    id: pr.id,
    number: pr.number,
    title: pr.title,
    author: pr.user.login,
    status: pr.state,
    updatedAt: pr.updated_at,
    description: pr.body,
    htmlUrl: pr.html_url,
  }));
};