#!/bin/bash

file='./data/trentino-altoadige_90m.tif'
gdallocationinfo $file -geoloc 11 46 -valonly
