#!/bin/bash

tar xvf deployment_keys.tar && rm -f deployment_keys.tar && sudo chmod 0444 *.pem && mv -f -t ~/.docker/ cert.pem key.pem ca.pem
export DOCKER_HOST="$DOCKERHOST" && export DOCKER_TLS_VERIFY=1

docker-compose pull
docker-compose stop
echo y | docker-compose rm
docker-compose up -d
#do it again because kong have some issues
docker-compose up -d
docker rmi $(docker images | grep "<none>" | awk "{print \$3}")

sleep 20

curl -i -X POST \
  --url http://localhost:8001/apis/ \
  --data 'name=oauth' \
  --data 'upstream_url=http://authorizationservice' \
  --data 'request_host=authorizationservice.manfredfris.ch'

curl -X POST http://localhost:8001/apis/oauth/plugins \
    --data "name=oauth2" \
    --data "config.enable_client_credentials=true"
