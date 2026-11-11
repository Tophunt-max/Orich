# ORich clone — single-image build: builds the Vue app + admin, serves both + the API from Node.
FROM node:20-alpine AS build
WORKDIR /src

# Build the user app (same-origin /api in production).
COPY app/package*.json app/
RUN cd app && npm ci
COPY app app
RUN cd app && npm run build

# Build the admin panel (same-origin /admin/api in production).
COPY admin/package*.json admin/
RUN cd admin && npm ci
COPY admin admin
RUN cd admin && VITE_ADMIN_API=/admin/api npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8788
# The server has no runtime dependencies; copy it and the built static output.
COPY server server
COPY --from=build /src/app/dist app/dist
COPY --from=build /src/admin/dist admin/dist
EXPOSE 8788
# In production set ORICH_HIDE_OTP=1, ADMIN_USER and ADMIN_PASS.
CMD ["node", "server/index.js"]
