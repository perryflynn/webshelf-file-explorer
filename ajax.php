<?php

include('init.php');

//--> Create Request
$request = null;
try {
   $request = new \Controller\Request();
} catch(Exception $ex) {
   echo json_encode(array("success"=>false, "message"=>"Could not create Request: ".$ex->getMessage(), "result"=>null));
   exit();
}

//--> Create Controller
$controllerclass = '\Controller\\'.$request->getController()."Controller";
if(!class_exists($controllerclass)) {
   echo json_encode(array("success"=>false, "message"=>"Controller not found.", "result"=>null));
   exit();
}

//--> Fire Action and print response
$c = new $controllerclass($request);
if(($c instanceof \Controller\BaseController)==false) {
   echo json_encode(array("success"=>false, "message"=>"Not a controller.", "result"=>null));
   exit();
}

try {
   echo $c->call($request->getAction())->toString();
} catch(Exception $ex) {
   echo json_encode(array("success"=>false, "message"=>"Exception: ".$ex->getMessage(), "result"=>null));
}
