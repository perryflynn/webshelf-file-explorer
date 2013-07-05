<?php

namespace Util;

class File {

   public static function deleteRecusive($file) {

      if(is_dir($file)) {
         $dh = @opendir($file);
         if(is_resource($dh)) {
            while (false !== ($obj = readdir($dh)))
            {
                if($obj == '.' || $obj == '..') {
                   continue;
                }
                if (!@unlink($file . '/' . $obj))
                {
                    self::deleteRecusive($file.'/'.$obj);
                }
            }
            closedir($dh);
            @rmdir($file);
         }
      } else if(is_file($file) || is_link($file)) {
         @unlink($file);
      }

   }

   /**
    * Recursively move files from one directory to another
    *
    * @param String $src - Source of files being moved
    * @param String $dest - Destination of files being moved
    * @see http://ben.lobaugh.net/blog/864/php-5-recursively-move-or-copy-files
    */
   public static function rmove($src, $dest){

       // If source is not a directory stop processing
       if(!is_dir($src)) return false;

       // If the destination directory does not exist create it
       if(!is_dir($dest)) {
           if(!mkdir($dest)) {
               // If the destination directory could not be created stop processing
               return false;
           }
       }

       // Open the source directory to read in files
       $i = new DirectoryIterator($src);
       foreach($i as $f) {
           if($f->isFile()) {
               rename($f->getRealPath(), "$dest/" . $f->getFilename());
           } else if(!$f->isDot() && $f->isDir()) {
               self::rmove($f->getRealPath(), "$dest/$f");
               unlink($f->getRealPath());
           }
       }
       unlink($src);
   }


   /**
    * Recursively copy files from one directory to another
    *
    * @param String $src - Source of files being moved
    * @param String $dest - Destination of files being moved
    * @see http://ben.lobaugh.net/blog/864/php-5-recursively-move-or-copy-files
    */
   public static function rcopy($src, $dest){

       // If source is not a directory stop processing
       if(!is_dir($src)) return false;

       // If the destination directory does not exist create it
       if(!is_dir($dest)) {
           if(!mkdir($dest)) {
               // If the destination directory could not be created stop processing
               return false;
           }
       }

       // Open the source directory to read in files
       $i = new DirectoryIterator($src);
       foreach($i as $f) {
           if($f->isFile()) {
               copy($f->getRealPath(), "$dest/" . $f->getFilename());
           } else if(!$f->isDot() && $f->isDir()) {
               self::rcopy($f->getRealPath(), "$dest/$f");
           }
       }
   }



}
