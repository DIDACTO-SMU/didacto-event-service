FROM node:21

WORKDIR /app/event-service/

COPY ./package.json /app/event-service/
COPY ./package-lock.json /app/event-service/

RUN npm install

COPY . /app/event-service/

# RUN  

CMD npm start