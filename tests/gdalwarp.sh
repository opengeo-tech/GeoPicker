#!/bin/bash
#
## usage: ./gdalwarp.sh 11 46 11.03 46.03

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

IN_FILE=${DIR}/data/wms.xml
OUT_FILE=${DIR}/data/wms.tif
MIN_X="${1}"
MIN_Y="${2}"
MAX_X="${3}"
MAX_Y="${4}"

rm -fr $OUT_FILE

gdalwarp -of GTiff -te_srs EPSG:4326 -te ${MIN_X} ${MIN_Y} ${MAX_X} ${MAX_Y} $IN_FILE $OUT_FILE
