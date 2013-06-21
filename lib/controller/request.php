<?php

namespace Controller;

class Request {

   const ARGTYPE_POST = "post";
   const ARGTYPE_GET = "get";

   private $controller;
   private $action;

   private $getargs;
   private $postargs;

   final function __construct()
   {
      $this->getargs = array();
      $this->postargs = array();

      if(!isset($_GET['controller'])) {
         throw new Exception("No controller defined");
      }

      if(!isset($_GET['action'])) {
         throw new Exception("No action defined");
      }

      $this->controller = $_GET['controller'];
      $this->action = $_GET['action'];

      if(isset($_GET['args']) && is_array($_GET['args']) && count($_GET['args'])>0) {
         $this->getargs = $_GET['args'];
      }

      if(isset($_POST['args']) && is_array($_POST['args']) && count($_POST['args'])>0) {
         $this->postargs = $_POST['args'];
      }

   }


   public function getController() {
      return $this->controller;
   }


   public function getAction() {
      return $this->action;
   }


   private function getArg($key, $type="get")
   {
      if($type!=Request::ARGTYPE_GET && $type!=Request::ARGTYPE_POST) {
         throw new Exception("Invalid arg type");
      }

      $property = $type."args";
      $props = $this->$property;

      if(isset($props[$key])) {
         return $props[$key];
      } else {
         throw new Exception("Key '".$key."' not exist");
      }

   }


   public function getPostArg($key) {
      return $this->getArg($key, Request::ARGTYPE_POST);
   }


   public function getGetArg($key) {
      return $this->getArg($key, Request::ARGTYPE_GET);
   }



}
