FROM ubuntu:18.04

# Installing necessary utilities
RUN apt update && \
    apt --yes upgrade && \
    apt --yes install \
        autoconf \
        automake \
        build-essential \
        cmake \
        libboost-dev \
        libboost-program-options-dev \
        libcurl4-openssl-dev \
        rapidjson-dev \
        libssl-dev \
        zlib1g-dev

# Preparing dependency modules

# - opendnp3
COPY deps/opendnp3 /tmp/opendnp3
WORKDIR /tmp/opendnp3/deps/asio/asio/
RUN sh autogen.sh && ./configure && make -j 4 && make install
RUN mkdir -p /tmp/build/opendnp3
WORKDIR /tmp/build/opendnp3
RUN cmake /tmp/opendnp3 && make -j 4 && make install

# - acl
COPY deps/acl /tmp/acl
COPY patches/acl.patch /tmp/acl.patch
WORKDIR /tmp/acl
RUN patch -p 1 < /tmp/acl.patch
RUN make && make install && \
    cp -r dist/include/* /usr/local/include && \
    cp dist/lib/linux64/* /usr/local/lib/

# - rabbitmq-c
COPY deps/rabbitmq-c /tmp/rabbitmq-c
RUN mkdir -p /tmp/build/rabbitmq-c
WORKDIR /tmp/build/rabbitmq-c
RUN cmake -DCMAKE_INSTALL_PREFIX=/usr/local /tmp/rabbitmq-c
RUN cmake --build . --config Release
RUN cmake --build . --config Release --target install
RUN ldconfig
WORKDIR /

# - Cleaning temporary results
RUN rm -rf \
    /tmp/opendnp3 \
    /tmp/acl \
    /tmp/rabbitmq-c \
    /tmp/build/ \
    /tmp/acl.patch

# Preparing our main program: DNP3 master
ADD ./dreams-master /dreams-master
WORKDIR /dreams-master
RUN mkdir bin
RUN make
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["/dreams-master/bin/dreams-master"]

