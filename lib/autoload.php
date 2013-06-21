<?php

class Autoloader {

   public static function load($classname) {
      self::load_libclass($classname);
   }

   private static function load_libclass($class) {
      $filename = "lib/".str_replace("\\", "/", strtolower($class)).".php";
      if(file_exists($filename) && is_file($filename) && is_readable($filename)) {
         include_once($filename);
      }
   }

}
