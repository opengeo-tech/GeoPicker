<?
#if(!isset($_GET['ll']))
#	die('parameter not found');
#list($lat,$lon) = explode(',',$_GET['ll']);

#sleep(3);

@header('Content-type: application/json; charset=utf-8');

$lat = filter_var($_GET['lat'],FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
$lng = filter_var($_GET['lng'],FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);

$dir = dirname(__FILE__).'/dems/';

$demFile = $dir.'esp.italy.tif';

$cmd = "./getPixelDem.py $demFile $lat $lng";

$val = shell_exec($cmd);

$esp = (int)round(floatval(trim($val)));//TODO se angolo ===0 ritorna null!!

echo json_encode( array('aspect'=>$esp ) );


?>
