<?php

/***
 * Bilder verkleinern
 * @author Christian Blechert
 */

namespace Util;

class NewImageResize {

   private $target_width;
   private $target_height;

   public function __construct($target_width, $target_height)
   {
      $this->target_width = $target_width;
      $this->target_height = $target_height;

      if(!(is_int($this->target_width) && $this->target_width>0 &&
              is_int($this->target_height) && $this->target_height>0))
      {
         throw new \InvalidArgumentException("Both parameters must be an integer!");
      }
   }

   /**
    * Load a image
    * @param type $image
    * @return \Util\NewImageResizeImage
    */
   public function load($image)
   {
      return new NewImageResizeImage($this, $image);
   }


   public function getTargetWidth()
   {
      return $this->target_width;
   }


   public function getTargetHeight()
   {
      return $this->target_height;
   }

}
