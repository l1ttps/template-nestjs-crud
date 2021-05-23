FROM node:13.11.0

RUN mkdir -p /home/node/app

VOLUME ["/home/node/app"]

WORKDIR /home/node/app

#COPY package*.json ./

#RUN npm install

#COPY . .

EXPOSE 3000
    
CMD [ "npx", "nest", "start" ]
