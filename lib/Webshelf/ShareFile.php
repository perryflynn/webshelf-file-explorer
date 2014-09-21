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

   public function getShareName()
   {
      return \FsTools\getShareFromPath($this->absfile);
   }

   public function isProtected()
   {
      return $this->config->isShareProtected($this->getShareName());
   }

   public function getDownloadUrl()
   {
      $protocol = ($_SERVER['SERVER_PORT']==443 ? "https://" : "http://");
      $server = $_SERVER['HTTP_HOST'];
      $urlpath = \FsTools\getBaseFolder();
      $filebase = preg_replace("/^".preg_quote(BASE, "/")."/", "", $this->absfile);

      if($this->isProtected())
      {
         $url = "index.php/get/".ltrim($filebase, "/");
      }
      else
      {
         $url = basename(BASE)."/".ltrim($filebase, "/");
      }

      return $protocol.$server.$urlpath.$url;
   }

}
