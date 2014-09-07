<?php

namespace Webshelf\Util;

class Response {

   private $is_success;
   private $message;
   private $result;

   final function __construct() {
      $this->is_success = true;
      $this->message = null;
      $this->result = null;
   }

   function __toString() {
      return $this->toString();
   }

   public function toString() {
      $response = new \stdClass();
      $response->success = $this->is_success;
      $response->message = $this->message;
      $response->result = $this->result;
      return json_encode($response);
   }

   public function setSuccess($b) {
      $this->is_success = ($b===true ? true : false);
      return $this;
   }

   public function success() {
      $this->setSuccess(true);
      return $this;
   }

   public function failure() {
      $this->setSuccess(false);
      return $this;
   }

   public function setMessage($msg) {
      $this->message = $msg;
      return $this;
   }

   public function setResult($result) {
      $this->result = $result;
      return $this;
   }

}
