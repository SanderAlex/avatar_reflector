<?php
	function copyImage($img) {
		$img_path = IMG_TEMP_FOLDER.md5($img);
		$img_type = substr($img, strrpos($img, '.') + 1);
		if($img_type != 'jpg')
			exit;
		if(copy($img, $img_path.'.'.$img_type))
			return $img_path.'.'.$img_type;
		else
			copyImage($img);
	}

	define('IMG_TEMP_FOLDER', "imgs_temp/");
	
	$images = $_POST['images'];

	$response = array();

	foreach ($images as $key => $value) {
		array_push($response, copyImage($value));
	}

	echo json_encode($response);
?>