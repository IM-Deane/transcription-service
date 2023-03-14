FROM node:18-alpine as base

RUN apk update || : && apk add --no-cache python3 py3-pip

WORKDIR /app

COPY package*.json tsconfig.json /
EXPOSE 5000

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["npm start"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /
CMD ["npm run dev"]