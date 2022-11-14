FROM node:12.22.4

COPY ./rest-api-dreams/package.json /rest-api-dreams/package.json
COPY ./rest-api-dreams/yarn.lock /rest-api-dreams/yarn.lock

WORKDIR /rest-api-dreams

RUN yarn install

COPY ./rest-api-dreams/ /rest-api-dreams/
COPY ./start.js /start.js
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

VOLUME /storage
EXPOSE 3000

CMD ["/start.sh"]
