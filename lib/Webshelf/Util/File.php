<?php

namespace Webshelf\Util;

class File
{

   /**
    * This function is to replace PHP's extremely buggy realpath().
    * source: http://stackoverflow.com/questions/4049856/replace-phps-realpath
    * @param string The original path, can be relative etc.
    * @return string The resolved path, it might not exist.
    */
   public static function truepath($path)
   {
      // whether $path is unix or not
      $unipath = (strlen($path)<1 || $path{0}!='/');

      // attempts to detect if path is relative in which case, add cwd
      if(strpos($path,':')===false && $unipath)
      {
         $path = getcwd().DIRECTORY_SEPARATOR.$path;
      }

      // resolve path parts (single dot, double dot and double delimiters)
      $path = str_replace(array('/', '\\'), DIRECTORY_SEPARATOR, $path);
      $parts = array_filter(explode(DIRECTORY_SEPARATOR, $path), 'strlen');
      $absolutes = array();
      foreach ($parts as $part)
      {
         // skip dot
         if ('.'  == $part)
         {
            continue;
         }

         // translate double dot
         if ('..' == $part)
         {
            array_pop($absolutes);
         }
         // add part
         else
         {
            $absolutes[] = $part;
         }
      }

      // build new absolute path
      $path = implode(DIRECTORY_SEPARATOR, $absolutes);

      // resolve any symlinks
      if(file_exists($path) && linkinfo($path)>0)
      {
         $path=readlink($path);
      }

      // put initial separator that could have been lost
      $path=($unipath===false ? DIRECTORY_SEPARATOR.$path : $path);

      if(is_dir($path))
      {
         $path .= DIRECTORY_SEPARATOR;
      }

      return $path;
   }


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
   public static function rmove($src, $dest)
   {
      if(is_file($src))
      {
         return rename($src, $dest.DIRECTORY_SEPARATOR.basename($src));
      }
      if(is_dir($dest))
      {
         $dest = $dest.DIRECTORY_SEPARATOR.basename($src).DIRECTORY_SEPARATOR;
      }

      // If the destination directory does not exist create it
      if(!is_dir($dest))
      {
         if(!mkdir($dest))
         {
            // If the destination directory could not be created stop processing
            return false;
         }
      }

      // Open the source directory to read in files
      $i = new \DirectoryIterator($src);
      foreach($i as $f)
      {
         if($f->isFile())
         {
            rename($f->getRealPath(), $dest.DIRECTORY_SEPARATOR.$f->getFilename());
         }
         else if(!$f->isDot() && $f->isDir())
         {
            self::rmove($f->getRealPath(), $dest.DIRECTORY_SEPARATOR.$f);
            if(is_dir($f->getRealPath()))
            {
               rmdir($f->getRealPath());
            }
         }
      }
      if(is_dir($src))
      {
         rmdir($src);
      }
      return true;
   }


   /**
    * Recursively copy files from one directory to another
    *
    * @param String $src - Source of files being moved
    * @param String $dest - Destination of files being moved
    * @see http://ben.lobaugh.net/blog/864/php-5-recursively-move-or-copy-files
    */
   public static function rcopy($src, $dest)
   {
      if(is_file($src))
      {
         return copy($src, rtrim($dest, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.basename($src));
      }

      if(is_dir($dest))
      {
         $dest = rtrim($dest, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.basename($src).DIRECTORY_SEPARATOR;
      }

      // If the destination directory does not exist create it
      if(!is_dir($dest))
      {
         if(!mkdir($dest))
         {
            // If the destination directory could not be created stop processing
            return false;
         }
      }

      // Open the source directory to read in files
      $i = new \DirectoryIterator($src);
      foreach($i as $f)
      {
         if($f->isFile())
         {
            copy($f->getRealPath(), $dest.DIRECTORY_SEPARATOR.$f->getFilename());
         }
         else if(!$f->isDot() && $f->isDir())
         {
            self::rcopy($f->getRealPath(), $dest.DIRECTORY_SEPARATOR.$f);
         }
      }

      return true;
   }



}
