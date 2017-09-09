<?php

$file = 'tiffs/esp.ita.tif';

$lat = filter_input(
              INPUT_GET, 
              'lat', 
              FILTER_SANITIZE_NUMBER_FLOAT, 
              FILTER_FLAG_ALLOW_FRACTION
            );
$lon = filter_input(
              INPUT_GET, 
              'lon', 
              FILTER_SANITIZE_NUMBER_FLOAT, 
              FILTER_FLAG_ALLOW_FRACTION
            );

$cmd = "gdallocationinfo $file -geoloc $lon $lat -valonly";

$o = shell_exec($cmd);

header('Content-Type: application/json');

echo json_encode(array('val'=>round($o)));

?>
