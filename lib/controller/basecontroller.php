<?php

namespace Controller;

abstract class BaseController {

   /**
    * @var \Controller\Request
    */
   protected $request;

   /**
    * @var \Controller\Response
    */
   protected $response;


   final function __construct(Request $request) {
      $this->request = $request;
      $this->response = new Response();
      $this->init();
   }

   public function init() {

   }

   public final function call($action)
   {
      $method = $action."Action";
      if(!method_exists($this, $method)) {
         throw new Exception("Action not exist");
      }

      try {
         $this->$method();
      } catch(Exception $ex) {
         $this->response->failure();
         $this->response->setMessage("Exception: ".$ex->getMessage());
         $this->response->setResult(null);
      }

      return $this->response->toString();
   }

}
