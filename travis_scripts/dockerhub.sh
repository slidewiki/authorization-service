#!/bin/bash

docker login -e="$DOCKER_EMAIL" -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"
docker build -t slidewiki/authorization-service:latest-dev ./
docker push slidewiki/authorization-service:latest-dev
