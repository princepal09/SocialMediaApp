# Pixora

Pixora is a social app for sharing photos and videos, following creators, and exchanging real-time direct messages. The public homepage includes a sample feed card visitors can see before signing in.

## Run locally

Use Node.js 22.12 or later. Copy the environment examples to `server/.env` and `client/.env`. The API needs Cloudinary credentials, Redis, separate random secrets for access and refresh tokens, and MongoDB with replica-set support for operations that use transactions. The API uses the `socialmedia` database.

```sh
npm ci --prefix client
npm ci --prefix server
npm run dev --prefix server
# In another terminal
npm run dev --prefix client
```

Open `http://localhost:3001`. Before releasing changes, run the frontend build and lint, plus the server build.

```sh
npm run build --prefix client
npm run lint --prefix client
npm run build --prefix server
```

## Production

The public frontend is [Pixora on Vercel](https://social-media-app-tan-three.vercel.app/). Its Git integration deploys updates to `main` to the stable production URL. The Vercel root directory is `client`. The existing Express and Socket.IO backend uses Render because the app needs a persistent WebSocket server.

1. On Render, use `server` as the root directory, `npm ci --include=dev && npm run build` to build, and `npm start` to serve the compiled API. Set the health check path to `/healthz`. Configure the variables in `server/.env.example` with production values and set `NODE_ENV=production`.
2. On Vercel, set `VITE_BASE_URL=https://socialmediaapp-jnbi.onrender.com/api/v1` for Production. `VITE_SOCKET_URL` is optional when the socket and API share an origin. On Render, set `CORS_ORIGIN=https://social-media-app-tan-three.vercel.app`. Add only trusted origins to this comma-separated allowlist.
3. With the Vercel and Render default domains, production uses partitioned cookies. Verify sign-in in the browsers you expect reviewers to use. If both services are on HTTPS subdomains of the same site, set `COOKIE_CROSS_SITE=false` and update the origins to those domains.
4. Check the public homepage and refresh a deep link such as `/login`. In two test accounts, verify registration, sign-in after a page refresh, posting an image, and sending a direct message. Check `/healthz` for the API’s MongoDB and Redis readiness.

Vercel serves the public homepage independently of the API. Full app availability also depends on the backend host and the database, cache, and media services.
