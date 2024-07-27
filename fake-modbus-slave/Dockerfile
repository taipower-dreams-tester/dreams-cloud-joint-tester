# base image: Python 3
FROM python:3.11-slim-bullseye

# environment setup
WORKDIR /fake-modbus-slave
EXPOSE 502/tcp
VOLUME ["/fake-modbus-slave/data/"]

# copy installation files
COPY requirements.txt ./

# install requirements.txt
RUN pip install --upgrade pip --no-cache-dir \
    && pip install --requirement requirements.txt --no-cache-dir

# copy project files
COPY fake_slave.py ./
COPY config.json ./

# run script
CMD ["python", "-m", "fake_slave"]
