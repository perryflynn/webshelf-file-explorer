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

}
