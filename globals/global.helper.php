<?php

namespace Helper {

   function response($success) {
      $r = new \Util\Response();
      $r->setSuccess($success);
      return $r;
   }

}
