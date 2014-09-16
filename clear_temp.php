<?php
	define('IMG_TEMP_FOLDER', "imgs_temp/");
	
	$images = $_POST['images'];

	foreach ($images as $key => $value) {
		$file_name = substr($value, strrpos($value, '/'));
		unlink(IMG_TEMP_FOLDER.$file_name);
	}
?>