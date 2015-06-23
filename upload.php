<?php
$response = array('messages'=>array());
$uploadSuccess = false;
try{
	if(!isset($_POST['data']) || !isset($_POST['name'])){
		throw new Exception('no POST data found');
	}
	$data = base64_decode(explode(',',$_POST['data'])[1]);
	$dataLength = strlen($data);
	$response['messages'][] = "data length: $dataLength";
	$fileName = $_POST['name'];
	$serverFile = time().$fileName;
	if(!$fp = fopen(dirname(__FILE__).'/data/'.$serverFile,'w')){ //Prepends timestamp to prevent overwriting
		throw new Exception("could not open $serverFile");
	}
	if(!fwrite($fp, $data))
		throw new Exception("could not write to $serverFile");
	fclose($fp);
	$response["serverFile"] = $serverFile;
	$uploadSuccess = true;
}catch(Exception $e){
	$response['messages'][] = $e->getMessage();
}
echo json_encode($response);
?>