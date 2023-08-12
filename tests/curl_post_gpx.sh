#!/bin/bash

SRC=$(readlink -f ${BASH_SOURCE[0]})
DIR=$(dirname ${SRC})

GEOM=$DIR/data/traccia_calisio_50pt.gpx

if [ -n "$1" ]; then
  GEOM=$1
fi

curl -v -s -X POST \
  -H "Content-Type: application/gpx+xml" \
  #-H "Accept-encoding: gzip" \
  -d @$GEOM \
  "http://localhost:9090/default/geometry"
  # | gunzip
  #1> /dev/null