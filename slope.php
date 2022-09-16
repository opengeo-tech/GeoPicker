<?php

$zone = filter_input(
              INPUT_GET, 
              'zone', 
              FILTER_SANITIZE_STRING, 
              FILTER_FLAG_STRIP_LOW | FILTER_FLAG_ENCODE_AMP
            );

$file = 'tiffs/'.($zone==='alps'?'alps':'italy').'/slope_30m.tif';

$lat = filter_input(
              INPUT_GET, 
              'lat', 
              FILTER_SANITIZE_NUMBER_FLOAT, 
              FILTER_FLAG_ALLOW_FRACTION
            );
$lon = filter_input(
              INPUT_GET, 
              'lng', 
              FILTER_SANITIZE_NUMBER_FLOAT, 
              FILTER_FLAG_ALLOW_FRACTION
            );

$cmd = "gdallocationinfo $file -geoloc $lon $lat -valonly";

$o = trim(shell_exec($cmd));

header('Content-Type: application/json');
$o = is_numeric($o) ? round($o) : null;
echo json_encode(array('val'=>$o));

?>
