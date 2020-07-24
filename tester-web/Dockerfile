FROM node:10.13.0

COPY ./cloud-joint-tester-web/package.json /cloud-joint-tester-web/package.json
WORKDIR /cloud-joint-tester-web
RUN yarn install

COPY ./cloud-joint-tester-web/ /cloud-joint-tester-web/
COPY ./start.js /start.js
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

VOLUME /cloud-joint-tester-web/build
CMD ["/start.sh"]
