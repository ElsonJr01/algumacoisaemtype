FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm install typescript tsc-alias tsconfig-paths --save-dev
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
