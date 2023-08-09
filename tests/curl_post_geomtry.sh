#!/bin/bash

SRC=$(readlink -f ${BASH_SOURCE[0]})
DIR=$(dirname ${SRC})

curl -v -s -X POST \
  -H "Content-Type: application/json; charset=UTF-8" \
  -H "Accept: application/json, */*" \
  -H "Accept-encoding: gzip" \
  -d @$DIR/data/traccia_alps_2000pt.geojson \
  http://localhost:9090/default/geometry | gunzip
  #1> /dev/null
