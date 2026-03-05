FROM node:22-alpine

WORKDIR /gamingtempest/backend

RUN apk add --no-cache dumb-init

COPY package*.json ./

RUN npm install

COPY . .

RUN mkdir -p uploads

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "dev"]