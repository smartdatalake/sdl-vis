FROM python:3

# See: https://github.com/phusion/baseimage-docker/issues/319
ARG DEBIAN_FRONTEND=noninteractive

COPY requirements.txt /tmp/

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
  apt-utils
RUN apt-get install -y \
  python-dev \
  libpq-dev

RUN pip install --upgrade pip
RUN pip install -r /tmp/requirements.txt
