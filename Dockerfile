FROM node:20-alpine

WORKDIR /app

# deps (cache Docker)
COPY package.json package-lock.json ./
RUN npm ci

# code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]