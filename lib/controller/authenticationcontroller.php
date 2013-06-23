<?php

namespace Controller;

class AuthenticationController extends BaseController {

   protected function getuserstatusAction()
   {
      try {
         $user = \JsonConfig::instance()->getUser();
         $this->response->setResult(array(
             "username" => \JsonConfig::instance()->getSessionUsername(),
             "loggedin" => true,
             "admin" => $user['admin'],
             "groups" => $user['groups'],
         ));
      } catch(\Exception $ex) {
         $this->response->setResult(array(
             "username" => null,
             "loggedin" => false,
             "admin" => false,
             "groups" => array(),
         ));
      }
      $this->response->success();
   }

   protected function loginAction()
   {
      $username = $this->request->getPostArg("username");
      $password = sha1($this->request->getPostArg("password"));

      try {
         $user = \JsonConfig::instance()->getUser($username);
         if($user['password']==$password) {
            \JsonConfig::instance()->setSessionUsername($username);
            $this->response->success();
            $this->response->setResult(true);
         } else {
            throw new Exception("fail");
         }
      } catch(\Exception $ex) {
         $this->response->failure();
         $this->response->setResult(false);
      }

   }

   protected function logoutAction()
   {
      \JsonConfig::instance()->setSessionUsername(null);
      $this->response->success();
      $this->response->setResult(true);
   }

}
