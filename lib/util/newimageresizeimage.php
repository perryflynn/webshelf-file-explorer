<?php

/***
 * Bilder verkleinern
 * @author Christian Blechert
 */

namespace Util;

class NewImageResizeImage {

   private $resizer;

   private $image_src_path;
   private $image_resource;

   private $image_create_function;
   private $image_save_function;
   private $mimetype;

   /**
    *
    * @var \Util\NewImageResizeDimensions
    */
   private $original_dimension;


   public function __construct(NewImageResize $resizer, $imagepath)
   {
      $this->resizer = $resizer;

      $this->image_src_path = $imagepath;
      if(!is_file($this->image_src_path))
      {
         throw new \InvalidArgumentException("File does not exist");
      }

      $fileinfo = pathinfo($this->image_src_path);
      $type = strtolower(trim($fileinfo["extension"]));

      if($type=="jpg" || $type=="jpeg" || $type=="gif" || $type=="png")
      {
         if($type=="jpg") $type="jpeg";

         $this->mimetype = "image/".$type;
         $this->image_create_function = "imagecreatefrom".$type;
         $this->image_save_function = "image".$type;

         if(!function_exists($this->image_create_function))
         {
            throw new \RuntimeException($this->image_create_function.": Function not supported");
         }

         if(!function_exists($this->image_save_function))
         {
            throw new \RuntimeException($this->image_save_function.": Function not supported");
         }

         $method = $this->image_create_function;
         $this->image_resource = $method($this->image_src_path);

         if(!(is_resource($this->image_resource) && get_resource_type($this->image_resource)=="gd"))
         {
            throw new \BadMethodCallException("Could not load image");
         }

         $this->original_dimension = new NewImageResizeDimensions($this->image_resource);

      }
   }


   /**
    * Bildbreite und -hoehe fuer Resize Aufruf ermitteln
    *
    * @param int $width          Breite des Ur-Bildes
    * @param int $height         Hoehe des Ur-Bildes
    * @param int $newMaxWidth    Maximale Breite nach dem Resizen
    * @param int $newMaxHeight   Maximale Hoehe nach dem Resizen
    *
    * @return Array[x-pixel, y-pixel]
    */
   private function getResizeSize($width, $height, $newMaxWidth, $newMaxHeight)
   {
      /*if($newMaxWidth<1) $newMaxWidth = $width;
      if($newMaxHeight<1) $newMaxHeight = $height;

      if($width > $newMaxWidth) {
         $newWidth = $newMaxWidth;
         $newHeight = intval($height * ($newWidth / $width));
         if($newHeight > $newMaxHeight) {
            $newHeight = $newMaxHeight;
            $newWidth = intval($width * ($newHeight / $height));
         }
      } elseif($height > $newMaxHeight) {
         $newHeight = $newMaxHeight;
         $newWidth = intval($width * ($newHeight / $height));
      } else {
         $newWidth = $width;
         $newHeight = $height;
      }

      return array($newWidth, $newHeight);*/

      if($width<=$height)
      {
         $newWidth = $newMaxWidth;
         $newHeight = intval($height * ($newWidth / $width));
         if($newHeight < $newMaxHeight)
         {
            $newHeight = $newMaxHeight;
            $newWidth = intval($width * ($newHeight / $height));
         }
      }
      elseif($height<=$width)
      {
         $newHeight = $newMaxHeight;
         $newWidth = intval($width * ($newHeight / $height));
         if($newWidth<$newMaxWidth)
         {
            $newWidth = $newMaxWidth;
            $newHeight = intval($height * ($newWidth / $width));
         }
      }
      else
      {
         $newWidth = $width;
         $newHeight = $height;
      }

      return array($newWidth, $newHeight);
   }


   public function getCurrentSize()
   {
      return new NewImageResizeDimensions($this->image_resource);
   }


   private function createNewDestination($newx, $newy)
   {
      $destination = imagecreatetruecolor($newx, $newy);
      imageAlphaBlending($destination, false);
      imageSaveAlpha($destination, true);

      $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
      imagefilledrectangle($destination, 0, 0, $newx, $newy, $transparent);

      return $destination;
   }


   /**
    *
    * @return \Util\NewImageResizeImage
    */
   public function resize()
   {
      $xy = $this->getCurrentSize();
      list($newx, $newy) = $this->getResizeSize($xy->getX(), $xy->getY(), $this->resizer->getTargetWidth(), $this->resizer->getTargetHeight());

      $destination = null;
      if($newx<$xy->getX() && $newy<$xy->getY())
      {
         $destination = $this->createNewDestination($newx, $newy);
         imagecopyresized($destination, $this->image_resource, 0, 0, 0, 0, $newx, $newy, $xy->getX(), $xy->getY());
      }
      else
      {
         $newx = $this->resizer->getTargetWidth();
         $newy = $this->resizer->getTargetHeight();
         $dst_x = intval((($newx/2)-($xy->getX()/2)));
         $dst_y = intval((($newy/2)-($xy->getY()/2)));

         $destination = $this->createNewDestination($newx, $newy);
         imagecopy($destination, $this->image_resource, $dst_x, $dst_y, 0, 0, $xy->getX(), $xy->getY());
      }

      $this->image_resource = $destination;

      return $this;
   }


   /**
    *
    * @return \Util\NewImageResizeImage
    */
   public function chop()
   {
      $xy = $this->getCurrentSize();
      $current_x = $xy->getX();
      $current_y = $xy->getY();
      $target_x = $this->resizer->getTargetWidth();
      $target_y = $this->resizer->getTargetHeight();

      if($target_x>$current_x)
      {
         $target_x = $current_x;
      }

      if($target_y>$current_y)
      {
         $target_y = $current_y;
      }

      $src_x = 0;
      $src_y = 0;

      $temp = intval((($current_x-$target_x)/2));
      if($temp>0)
      {
         $src_x = $temp;
      }

      /*$temp = intval((($current_y-$target_y)/2));
      if($temp>0)
      {
         $src_y = $temp;
      }*/

      $destination = $this->createNewDestination($target_x, $target_y);
      imagecopy($destination, $this->image_resource, 0, 0, $src_x, $src_y, $target_x, $target_y);

      $this->image_resource = $destination;

      return $this;
   }


   public function display($die=true)
   {
      header("Content-Type: ".$this->mimetype, true);
      $method = $this->image_save_function;
      $method($this->image_resource);

      if($die===true)
      {
         exit;
      }
   }


   public function save($file)
   {
      $method = $this->image_save_function;
      $method($this->image_resource, $file);
   }


}
