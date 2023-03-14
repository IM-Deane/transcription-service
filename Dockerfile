FROM node:18-alpine as base

RUN apk update || : && apk add --no-cache python3 py3-pip

WORKDIR /

COPY package*.json tsconfig.json dist ./
EXPOSE 5000

FROM base as prod
ENV NODE_ENV=production
RUN npm ci
COPY . .
CMD ["npm", "start"]