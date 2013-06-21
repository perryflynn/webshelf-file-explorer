<?php

namespace Controller;

class Response {

   private $is_success;
   private $message;
   private $result;

   final function __construct() {
      $this->is_success = false;
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

   public function success() {
      $this->is_success = true;
   }

   public function failure() {
      $this->is_success = false;
   }

   public function setMessage($msg) {
      $this->message = $msg;
   }

   public function setResult($result) {
      $this->result = $result;
   }

}
