FROM node:10.21.0

COPY ./rest-api-dreams/package.json /rest-api-dreams/package.json

WORKDIR /rest-api-dreams

RUN yarn install

COPY ./rest-api-dreams/ /rest-api-dreams/
COPY ./start.js /start.js
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

VOLUME /storage
EXPOSE 3000

CMD ["/start.sh"]
