<?php

/***
 * Bilder verkleinern
 * @author Christian Blechert
 */

namespace Webshelf\Util;

class ImageResize {

   private $img_file_src;
   private $img_filename_src;
   private $img_file_dest;
   private $img_filename_dest;
   private $img_width;
   private $img_width_old;
   private $img_width_new;
   private $img_height;
   private $img_height_old;
   private $img_height_new;


   /**
    * Resize Aufrufsfunktion
    * @param String   $filename_src    Quelldatei
    * @param String   $filename_dest   Zieldatei
    * @param int      $width           Neue Breite
    * @param int      $height          Neue Hoehe
    * @return bool
    */
   public function resize($filename_src, $filename_dest, $width, $height) {

      $this->img_filename_src  = $filename_src;
      $this->img_filename_dest = $filename_dest;
      $this->img_width         = $width;
      $this->img_height        = $height;

      $image_size = getimagesize($this->img_filename_src);

      if(file_exists($this->img_filename_src) && $image_size!=false) {

         $image_size = getimagesize($this->img_filename_src);
         if($image_size[0]<=$this->img_width && $image_size[1]<=$this->img_height) {
            copy($filename_src, $filename_dest);
            return true;
         }

         $fileinfo = pathinfo($this->img_filename_src);
         $type = strtolower(trim($fileinfo["extension"]));

         if($type=="jpg" || $type=="jpeg" || $type=="gif" || $type=="png") {

            if($type=="jpg") $type="jpeg";
            $function_image_create = "imagecreatefrom".$type;
            $function_image = "image".$type;

            $this->img_file_src = $function_image_create($this->img_filename_src);
            $this->resize_create();
            $function_image($this->img_file_dest, $this->img_filename_dest);

         } else {
            return false;
         }

         return true;
      } else {
         return false;
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
   private function get_resize_size($width, $height, $newMaxWidth, $newMaxHeight) {

      //echo " ==>"; var_dump($width); var_dump($height); var_dump($newMaxWidth); var_dump($newMaxHeight); echo " <== ";
      //die();

      if($newMaxWidth<1) $newMaxWidth = $width;
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

      //echo " >> "; var_dump(array($newWidth, $newHeight)); echo " << ";

      return array($newWidth, $newHeight);

   }


   /**
    * Resize
    */
   private function resize_create($alpha=false) {

      $this->img_width_old  = imagesx($this->img_file_src);
      $this->img_height_old = imagesy($this->img_file_src);

      /*if(($this->img_width > 0) AND ($this->img_height > 0)) {
         $this->img_width_new  = $this->img_width;
         $this->img_height_new = $this->img_height;
      }
      elseif($this->img_width > 0) {
         $this->img_width_new  = $this->img_width;
         $this->img_height_new = $this->img_height_old*($this->img_width/$this->img_width_old);
      }
      elseif($this->img_height > 0) {
         $this->img_width_new  = $this->img_width_old*($this->img_height/$this->img_height_old);
         $this->img_height_new = $this->img_height;
      }
      elseif(($this->img_width == $this->img_width_old) AND ($this->img_height == $this->img_height_old)) {
         $this->img_width_new  = $this->img_width;
         $this->img_height_new = $this->img_height;
      } else {
         $this->img_width_new  = $this->img_width_old;
         $this->img_height_new = $this->img_height_old;
      }*/
      //var_dump($this->get_resize_size($this->img_width_old, $this->img_height_old, $this->img_width, $this->img_height));

      list($this->img_width_new, $this->img_height_new) = $this->get_resize_size($this->img_width_old, $this->img_height_old, $this->img_width, $this->img_height);
      $this->img_file_dest = imagecreatetruecolor($this->img_width_new, $this->img_height_new);

      //$background = imagecolorallocate($this->img_file_dest, 0, 0, 0);
      //ImageColorTransparent($this->img_file_dest, $background); // make the new temp image all transparent
      //imagealphablending($this->img_file_dest, false); // turn off the alpha blending to keep the alpha channel
      imageAlphaBlending($this->img_file_dest, false);
      imageSaveAlpha($this->img_file_dest, true);
      //imageantialias($this->img_file_dest, true);

      $transparent = imagecolorallocatealpha($this->img_file_dest, 255, 255, 255, 127);
      imagefilledrectangle($this->img_file_dest, 0, 0, $this->img_width_new, $this->img_height_new, $transparent);

      imagecopyresized($this->img_file_dest, $this->img_file_src, 0, 0, 0, 0, $this->img_width_new, $this->img_height_new, $this->img_width_old, $this->img_height_old);

   }


}

?>
