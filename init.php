<?php

session_start();

define('ROOT', dirname(__FILE__).DIRECTORY_SEPARATOR);
define('BASE', ROOT."files".DIRECTORY_SEPARATOR);
define('JSONCONFIG', ROOT.'jsonconfig.php');

//--> Composer autoloader
require_once ROOT.'vendor/autoload.php';

//--> Check base
if(!(file_exists(BASE) && is_dir(BASE))) {
   if(@mkdir(BASE, 0775)!==true) {
      echo json_encode(array("success"=>false, "message"=>"Could not create ".BASE, "result"=>null));
      exit();
   }
}

// Load global functions
$globals = glob(ROOT."globals/global.*.php");
foreach($globals as $global) {
   include($global);
}

//--> Load config
JsonConfig::instance()->setConfigName(JSONCONFIG);
JsonConfig::instance()->setSessionUsername((isset($_SESSION[JsonConfig::SESSION_NAME]) ? $_SESSION[JsonConfig::SESSION_NAME] : null));
