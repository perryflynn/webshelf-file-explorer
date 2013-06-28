<?php

session_start();

define('ROOT', dirname(__FILE__).DIRECTORY_SEPARATOR);
define('BASE', ROOT."files".DIRECTORY_SEPARATOR);
define('JSONCONFIG', ROOT.'jsonconfig.php');

//--> Check base
if(!(file_exists(BASE) && is_dir(BASE))) {
   if(@mkdir(BASE, 0775)!==true) {
      echo json_encode(array("success"=>false, "message"=>"Could not create ".BASE, "result"=>null));
      exit();
   }
}

//--> Autoloader
include_once('lib/autoload.php');
spl_autoload_register('\Autoloader::load');

//--> Load config
JsonConfig::instance()->setConfigName(JSONCONFIG);
JsonConfig::instance()->setSessionUsername((isset($_SESSION[JsonConfig::SESSION_NAME]) ? $_SESSION[JsonConfig::SESSION_NAME] : null));
