
FROM node:20 
ENV TZ=Asia/Kolkata

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]