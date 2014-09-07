<?php

namespace Webshelf\Util;

abstract class Singleton {

   protected static $instance = array();

   private final function __construct() {
      $this->init();
   }

   private final function __clone() {

   }

   public static function instance() {
      $calledClass = get_called_class();
      if(!isset(self::$instance[$calledClass]))
      {
         self::$instance[$calledClass] = new $calledClass();
      }
      return self::$instance[$calledClass];
   }

   abstract protected function init();

}

