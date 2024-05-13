this is my first time pull image from github folder
it have limit to Rate-limits (up to `60 per-hour` for anonymous, up to 5,000 per-hour for authenticated)

[How to get a file via GitHub APIs - Stack Overflow](https://stackoverflow.com/questions/9272535/how-to-get-a-file-via-github-apis)

need to do authenticated to make it more stable by

1.  create `.env` file and add line below to pc

```
VITE_GITHUB_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. and add github secret in github

3. ยังคงการเรียก header ตามด้านล่าง

```tsx
const response = await fetch(
  `https://api.github.com/repos/${owner}/${repo}/contents/ImageDB/Fixed/`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);
```

4. ให้ทำการ build vite ผ่าน github action โดย ทำตามนี้

   [Deploying a Vite app on GitHub Pages using GitHub Actions with GitHub Secrets - DEV Community](https://dev.to/dwtoledo/deploying-a-vite-app-on-github-pages-using-github-actions-with-github-secrets-1hn0)

### problem that face after revisit

forget how to do git secret env

### fix by

1. get new token from `setting > developer setting > personal access token > Token (classic) > The value of garden — repo` is the value that need to write in `.env` file
2. add `.env` file that have this one line `VITE_GITHUB_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### thing that needed

1. Environment secrets
2. token

The Repository secrets is `not` needed
