FROM node:lts-alpine

WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .
RUN npm run build
USER node

CMD ["npm","start"]
