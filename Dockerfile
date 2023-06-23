FROM node:16-alpine3.17

COPY package*.json ./

RUN npm install

copy . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
