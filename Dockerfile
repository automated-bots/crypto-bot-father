FROM node:lts-slim
ENV NODE_ENV production

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install --omit=dev && \
  chown -R node:node node_modules

COPY . .

USER node

EXPOSE 3007

HEALTHCHECK --interval=10s --timeout=12s --start-period=6s \
  CMD node healthcheck.js

CMD ["npm", "start"]
