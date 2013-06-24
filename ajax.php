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

//--> Create Request
$request = null;
try {
   $request = new \Controller\Request();
} catch(Exception $ex) {
   die("Could not create Request: ".$ex->getMessage());
}

//--> Create Controller
$controllerclass = '\Controller\\'.$request->getController()."Controller";
if(!class_exists($controllerclass)) {
   die("Controller not found.");
}

//--> Fire Action and print response
$c = new $controllerclass($request);
if(($c instanceof \Controller\BaseController)==false) {
   throw new Exception("This is not a controller.");
}

try {
   echo $c->call($request->getAction());
} catch(Exception $ex) {
   echo json_encode(array("success"=>false, "message"=>"Exception: ".$ex->getMessage(), "result"=>null));
}
