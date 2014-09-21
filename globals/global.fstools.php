<?php

namespace FsTools
{

   function getShareFromPath($path)
   {
      $pathlist = array(
          \Webshelf\Util\File::truepath($path),
          //realpath($path).DIRECTORY_SEPARATOR
      );

      foreach($pathlist as $currentpath)
      {
         $rgx = "/^".preg_quote(BASE, "/")."(.*?)".preg_quote(DIRECTORY_SEPARATOR, "/")."/";

         $match = array();
         $result = preg_match($rgx, $currentpath, $match);
         if($result===1)
         {
            $temp = trim($match[1]);
            if(!empty($temp) && $temp!="." && $temp!="..")
            {
               return $temp;
            }
         }
      }
      throw new \Exception("Unable to extract share");
   }

   function getUniqName($file)
   {
      $path = dirname($file)."/";
      $xfilename = basename($file);

      $search = array("ä", "ü", "ö", "ß", "€", "Ä", "Ü", "Ö");
      $replace = array("ae", "ue", "oe", "ss", "euro", "Ae", "Ue", "Oe");
      $xfilename = str_replace($search, $replace, $xfilename);
      $xfilename = preg_replace("/[^A-Za-z0-9_\-\.]/", "_", $xfilename);
      $targetfile = $path."/".$xfilename;
      $namecount = 0;

      while(file_exists($targetfile))
      {
         $namecount++;
         preg_match("/^([^\.]*)(?:\.(.*?))?\$/", $xfilename, $filenameparts);
         unset($filenameparts[0]);
         $targetfile = $path."/".$filenameparts[1]."_".$namecount.(isset($filenameparts[2]) ? ".".$filenameparts[2] : "");
      }

      return $targetfile;
   }

   function is_allowed($filter, $path, $throw=false) {
      $rpath = realpath($path);

      if($rpath==false && $throw==true) {
         throw new \Webshelf\FileNotFoundException("File not found: ".$path);
      }

      // Filetype allowed?
      $typefilter = false;
      if($filter=="folders" && is_dir($rpath)) {
         $typefilter = true;
      } elseif($filter=="files" && is_file($rpath)) {
         $typefilter = true;
      } elseif($filter=="all" && (is_file($rpath) || is_dir($rpath))) {
         $typefilter = true;
      }

      // Share allowed?
      $shares = \JsonConfig::instance()->getUserShares();
      $share = \FsTools\getShareFromPath($rpath);

      $final = ($typefilter && in_array($share, $shares));

      if($final==false && $throw==true) {
         throw new \Webshelf\AccessDeniedException("Access denied: ".$path);
      }

      return $final;

   }

   function getBaseFolder() {
      $urlpath = "/";
      if(preg_match("/^\/(.*?)\/index\.php/", $_SERVER['PHP_SELF'], $foldermatch)===1) {
         $urlpath = "/".$foldermatch[1]."/";
      }
      return $urlpath;
   }

}
