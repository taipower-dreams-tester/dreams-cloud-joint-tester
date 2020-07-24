FROM rabbitmq:3.7.7-management-alpine
COPY configure.sh /configure.sh
RUN chmod +x /configure.sh
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

