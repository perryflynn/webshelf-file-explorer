<?php

namespace Webshelf;

class ShareFile
{

   private $config;
   private $absfile;

   public function __construct($absfile, \JsonConfig $jsonconfig)
   {
      $this->absfile=$absfile;
      $this->config = $jsonconfig;

      if(!is_file($this->absfile))
      {
         throw new \Webshelf\FileNotFoundException("file not found");
      }

      if(!($this->config instanceof \JsonConfig))
      {
         throw new \Webshelf\Exception("Not a JsonConfig instance");
      }
   }



}
