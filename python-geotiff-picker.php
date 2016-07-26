<?php

$lat = 12.50304;
$lon = 42.24443;

$tiffs = array(
	'dem'=> 'tiffs/dem.ita.tif',
	'esp'=> 'tiffs/esp.ita.tif'
);

$urls = array(
	"/(dem|esp)/",
	"latlon2val"
);

$file = $tiffs['dem'];

$o = shell_exec("gdallocationinfo $file -geoloc $lat $lon -valonly");

print_r($o);

?>