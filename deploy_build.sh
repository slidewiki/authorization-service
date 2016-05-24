#!/bin/bash

docker build -t slidewiki/authorizationservice ./
docker rmi $(docker images | grep "<none>" | awk "{print \$3}")
docker push slidewiki/authorizationservice
