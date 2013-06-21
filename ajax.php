<?php

define('BASE', dirname(__FILE__)."/files/");

//--> Autoloader
include_once('lib/autoload.php');
spl_autoload_register('\Autoloader::load');


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
   die("Action not found.");
}
