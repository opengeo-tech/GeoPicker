#!/usr/bin/env node
'use strict';

//TODO lib for options
//TOD add in package

const fs = require('fs');
const { Console } = require("console");
const console = new Console(process.stderr);

const {setValue, getValue, densify} = require('../lib');

const fileRaster = process.argv[2];
const fileLine = process.argv[3];


console.time();

const geojson = JSON.parse(fs.readFileSync(fileLine,'utf-8'));

setValue(geojson, fileRaster);

process.stdout.write(JSON.stringify(geojson,null,4));

console.timeEnd();
