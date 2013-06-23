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

   protected function grouplistAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $cfg = \JsonConfig::instance()->loadConfiguration();

      $result = array();
      foreach($cfg['groups'] as $groupname => $groupdata) {
         $result[] = array(
             "name" => $groupname,
             "shares" => count($groupdata['shares']),
         );
      }

      $this->response->success();
      $this->response->setResult($result);
   }

   protected function groupsharelistAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $groupname = $this->request->getGetArg("group");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      $this->response->success();
      $this->response->setResult($cfg['groups'][$groupname]['shares']);
   }

   protected function deleteshareAction()
   {
      $share = $this->request->getPostArg("share");
      $group = $this->request->getPostArg("group");

      $cfg = \JsonConfig::instance()->loadConfiguration();
      $delindex = -1;
      foreach($cfg['groups'][$group]['shares'] as $index => $cshare) {
         var_dump($cshare['path'],$share);
         if($cshare['path']==$share) {
            $delindex = $index;
            break;
         }
      }

      if($delindex>=0) {
         unset($cfg['groups'][$group]['shares'][$delindex]);
         \JsonConfig::instance()->createConfiguration($cfg);
         $this->response->success();
      } else {
         $this->response->failure();
      }

   }

   protected function updateshareAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $group = $this->request->getPostArg("group");
      $path = $this->request->getPostArg("path");
      $read = $this->request->getPostArg("read");
      $download = $this->request->getPostArg("download");
      $delete = $this->request->getPostArg("delete");

      $cfg = \JsonConfig::instance()->loadConfiguration();
      $delindex = -1;
      foreach($cfg['groups'][$group]['shares'] as $index => $cshare) {
         if($cshare['path']==$path) {
            $delindex = $index;
            break;
         }
      }

      $newshare = array(
         "path" => $path,
         "read" => ($read=="true" ? true : false),
         "delete" => ($delete=="true" ? true : false),
         "download" => ($download=="true" ? true : false),
      );

      if($delindex>=0) {
         $cfg['groups'][$group]['shares'][$delindex] = $newshare;
      } else {
         $cfg['groups'][$group]['shares'][] = $newshare;
      }

      \JsonConfig::instance()->createConfiguration($cfg);
      $this->response->success();
   }

   protected function addgroupAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $group = $this->request->getPostArg("group");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(isset($cfg['groups'][$group])) {
         $this->response->failure();
      } else {
         $cfg['groups'][$group] = array("shares" => array());
         \JsonConfig::instance()->createConfiguration($cfg);
         $this->response->success();
      }

   }

   protected function deletegroupAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $group = $this->request->getPostArg("group");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      $hitcount = 0;
      foreach($cfg['users'] as $username => &$userdata) {
         $index = array_search($group, $userdata['groups']);
         if($index!==false) {
            $hitcount++;
            unset($userdata['groups'][$index]);
         }
      }
      unset($userdata);

      unset($cfg['groups'][$group]);

      \JsonConfig::instance()->createConfiguration($cfg);
      if($hitcount>0) {
         $this->response->success();
      } else {
         $this->response->failure();
      }
   }



}
