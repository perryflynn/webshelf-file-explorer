<?php

namespace FsTools {

   function getShareFromPath($path) {
      $path = realpath($path).DIRECTORY_SEPARATOR;
      $rgx = "/^".preg_quote(BASE, "/")."(.*?)".preg_quote(DIRECTORY_SEPARATOR, "/")."/";
      $result = preg_match($rgx, $path, $match);
      if($result!==1) {
         throw new Exception("Share can't extracted");
      }
      return $match[1];
   }

   function getUniqName($file) {
      $path = dirname($file)."/";
      $xfilename = basename($file);

      $search = array("ä", "ü", "ö", "ß", "€", "Ä", "Ü", "Ö");
      $replace = array("ae", "ue", "oe", "ss", "euro", "Ae", "Ue", "Oe");
      $xfilename = str_replace($search, $replace, $xfilename);
      $xfilename = preg_replace("/[^A-Za-z0-9_\-\.]/", "_", $xfilename);
      $targetfile = $path."/".$xfilename;
      $namecount = 0;

      while(file_exists($targetfile)) {
         $namecount++;
         preg_match("/^([^\.]*)(?:\.(.*?))?\$/", $xfilename, $filenameparts);
         unset($filenameparts[0]);
         $targetfile = $path."/".$filenameparts[1]."_".$namecount.(isset($filenameparts[2]) ? ".".$filenameparts[2] : "");
      }

      return $targetfile;
   }

   function is_allowed($filter, $path) {
      $path = realpath($path);

      // Filetype allowed?
      $typefilter = false;
      if($filter=="folders" && is_dir($path)) {
         $typefilter = true;
      } elseif($filter=="files" && is_file($path)) {
         $typefilter = true;
      } elseif($filter=="all" && (is_file($path) || is_dir($path))) {
         $typefilter = true;
      }

      // Share allowed?
      $shares = \JsonConfig::instance()->getUserShares();
      $share = $this->getShareFromPath($path);

      $final = ($typefilter && in_array($share, $shares));
      return $final;

   }

}
