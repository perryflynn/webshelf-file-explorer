<?php

/***
 * Bilder verkleinern
 * @author Christian Blechert
 */

namespace Util;

class NewImageResizeDimensions {

   private $x;
   private $y;

   public function __construct($imageresource)
   {
      if(!(is_resource($imageresource) && get_resource_type($imageresource)=="gd"))
      {
         throw new \BadMethodCallException("Parameter is not a image resource");
      }

      $this->x = imagesx($imageresource);
      $this->y = imagesy($imageresource);
   }

   public function getX()
   {
      return $this->x;
   }

   public function getY()
   {
      return $this->y;
   }

   public function getXY()
   {
      return array($this->x, $this->y);
   }

}
