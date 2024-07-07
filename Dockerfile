FROM node:22-slim
ENV NODE_ENV=production

ARG DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --omit=dev --no-fund --no-audit && \
  chown -R node:node node_modules

COPY . .

USER node

EXPOSE 3007

HEALTHCHECK --interval=20s --timeout=12s --start-period=6s \
  CMD node healthcheck.js

CMD ["npm", "start"]
