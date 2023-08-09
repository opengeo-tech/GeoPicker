#!/bin/bash

SRC=$(readlink -f ${BASH_SOURCE[0]})
DIR=$(dirname ${SRC})

curl -v -s -X POST \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json, */*" \
  -H "Accept-encoding: gzip" \
  -d @$DIR/data/traccia_alps_1000pt.json \
  http://localhost:9090/default/locations | gunzip
  #1> /dev/null