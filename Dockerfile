FROM node:18

WORKDIR /rtc-server/

COPY ./package.json /rtc-server/
COPY ./package-lock.json /rtc-server/

RUN yarn install

COPY . /rtc-server/

# RUN  

CMD npm start