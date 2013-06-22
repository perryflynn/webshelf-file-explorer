<?php

namespace Util;

abstract class Singleton {

   protected static $instance;

   private final function __construct() {
      $this->init();
   }

   public static function instance() {
      if((self::$instance instanceof Singleton)==false) {
         $calledClass = get_called_class();
         self::$instance = new $calledClass();
      }
      return self::$instance;
   }

   abstract protected function init();

}

