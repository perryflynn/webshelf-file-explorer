<?php

namespace Helper {

   function response($success) {
      $r = new \Webshelf\Util\Response();
      $r->setSuccess($success);
      return $r;
   }

}
