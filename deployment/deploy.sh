#!/bin/bash

docker-compose pull
docker-compose stop && docker-compose rm
docker-compose up -d
docker rmi $(docker images | grep "<none>" | awk "{print \$3}")
