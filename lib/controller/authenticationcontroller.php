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
             "deletable" => (isset($groupdata['deletable']) && $groupdata['deletable']==false ? false : true),
             "saved" => true,
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

      if(!\JsonConfig::instance()->groupExist($groupname)) {
         $this->response->failure();
         return;
      }

      $result = array();
      foreach($cfg['groups'][$groupname]['shares'] as $share) {
         $result[] = array(
            "path" => $share['path'],
            "delete" => $share['delete'],
            "read" => $share['read'],
            "protected" => (isset($share['protected']) ? $share['protected'] : true),
            "upload" => (isset($share['upload']) ? $share['upload'] : false),
            "mkdir" => (isset($share['mkdir']) ? $share['mkdir'] : false),
            "copy" => (isset($share['copy']) ? $share['copy'] : false),
            "move_rename" => (isset($share['move_rename']) ? $share['move_rename'] : false),
            "download" => $share['download'],
            "saved" => true,
         );
      }

      $this->response->success();
      $this->response->setResult($result);
   }

   protected function deleteshareAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $share = $this->request->getPostArg("share");
      $group = $this->request->getPostArg("group");

      if(!\JsonConfig::instance()->groupExist($group))
      {
         $this->response->failure();
         return;
      }

      $cfg = \JsonConfig::instance()->loadConfiguration();
      $delindex = -1;
      foreach($cfg['groups'][$group]['shares'] as $index => $cshare) {
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
      $protected = $this->request->getPostArg("protected");
      $upload = $this->request->getPostArg("upload");
      $mkdir = $this->request->getPostArg("mkdir");
      $copy = $this->request->getPostArg("copy");
      $move_rename = $this->request->getPostArg("move_rename");
      $download = $this->request->getPostArg("download");
      $delete = $this->request->getPostArg("delete");

      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->groupExist($group) || empty($group) || empty($path)) {
         $this->response->failure();
         return;
      }

      if(strpos($path, "/")!==false) {
         $this->response->setMessage("Illegal character in share name");
         $this->response->failure();
         return;
      }

      // Protection settings
      $accessfile = BASE.$path.DIRECTORY_SEPARATOR.".htaccess";
      if($protected!="true" && is_file($accessfile)) {
         if(trim(file_get_contents($accessfile))=="deny from all") {
            @unlink($accessfile);
         } else {
            @rename($accessfile, dirname($accessfile).DIRECTORY_SEPARATOR."htaccess-".date("Y-m-d-H-i-s").".txt");
         }
      } else if($protected=="true" && !is_file($accessfile)) {
         @file_put_contents($accessfile, "\ndeny from all\n", FILE_APPEND);
      }

      foreach($cfg['groups'] as $groupname => $groupdata) {
         foreach($groupdata['shares'] as $sharename => $sharesettings) {
            if($sharesettings['path']==$path) {
               $cfg['groups'][$groupname]['shares'][$sharename]['protected'] = ($protected=="true");
            }
         }
      }

      // Find share index
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
         "protected" => ($protected=="true" ? true : false),
         "upload" => ($upload=="true" ? true : false),
         "mkdir" => ($mkdir=="true" ? true : false),
         "copy" => ($copy=="true" ? true : false),
         "move_rename" => ($move_rename=="true" ? true : false),
         "delete" => ($delete=="true" ? true : false),
         "download" => ($download=="true" ? true : false),
      );

      if($delindex>=0) {
         $cfg['groups'][$group]['shares'][$delindex] = $newshare;
      } else {
         $cfg['groups'][$group]['shares'][] = $newshare;
      }

      if(!(file_exists(BASE.$path) && is_dir(BASE.$path))) {
         @mkdir(BASE.$path, 0775);
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

      if(empty($group)) {
         $this->response->failure();
         return;
      }

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

      if(!\JsonConfig::instance()->groupExist($group)) {
         $this->response->failure();
         return;
      }

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

   protected function userlistAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $cfg = \JsonConfig::instance()->loadConfiguration();
      $actuser = \JsonConfig::instance()->getSessionUsername();

      $result = array();
      foreach($cfg['users'] as $username => $userdata) {
         $result[] = array(
             "name" => $username,
             "admin" => $userdata['admin'],
             "deletable" => ($username==$actuser ? false : true),
             "saved" => true,
         );
      }

      $this->response->success();
      $this->response->setResult($result);
   }

   protected function setpasswordAction()
   {
      $username = $this->request->getPostArg('username');
      $password = $this->request->getPostArg('password');
      $actuser = \JsonConfig::instance()->getSessionUsername();
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->isAdmin() && $username!=\JsonConfig::instance()->getSessionUsername()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      if(!\JsonConfig::instance()->userExist($username)) {
         $this->response->failure();
         return;
      }

      if(($actuser==$username || \JsonConfig::instance()->isAdmin()) &&
         \JsonConfig::instance()->userExist($username))
      {
         $cfg['users'][$username]['password'] = sha1($password);
         \JsonConfig::instance()->createConfiguration($cfg);
         $this->response->success();
      }
      else
      {
         $this->response->failure();
      }

   }

   protected function updateuserAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $username = $this->request->getPostArg("username");
      $admin = ($this->request->getPostArg("admin")=="true" ? true : false);
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(empty($username)) {
         $this->response->failure();
         return;
      }

      if(isset($cfg['users'][$username])) {
         $cfg['users'][$username]['admin'] = $admin;
      } else {
         $cfg['users'][$username] = array("admin"=>$admin, "password"=>"", "groups"=>array());
      }

      \JsonConfig::instance()->createConfiguration($cfg);
      $this->response->success();

   }

   protected function deleteuserAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $username = $this->request->getPostArg("username");
      $actuser = \JsonConfig::instance()->getSessionUsername();
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->userExist($username)) {
         $this->response->failure();
         return;
      }

      if($actuser==$username) {
         $this->response->failure();
      } else {
         unset($cfg['users'][$username]);
         \JsonConfig::instance()->createConfiguration($cfg);
         $this->response->success();
      }

   }

   protected function usergrouplistAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $username = $this->request->getGetArg("username");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->userExist($username)) {
         $this->response->failure();
         return;
      }

      $result = array();
      foreach($cfg['groups'] as $name => $data)
      {
         $result[] = array(
            "name" => $name,
            "member" => (in_array($name, $cfg['users'][$username]['groups'])),
         );
      }

      $this->response->setResult($result);
      $this->response->success();

   }

   protected function changegroupmembershipAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $username = $this->request->getPostArg("username");
      $group = $this->request->getPostArg("group");
      $memberof = ($this->request->getPostArg("memberof")=="true" ? true : false);
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->groupExist($group) ||
         !\JsonConfig::instance()->userExist($username))
      {
         $this->response->failure();
         return;
      }

      $groupidx = array_search($group, $cfg['users'][$username]['groups']);
      if($memberof && $groupidx===false) {
         $cfg['users'][$username]['groups'][] = $group;
      }
      else if($memberof==false && $groupidx!==false)
      {
         unset($cfg['users'][$username]['groups'][$groupidx]);
      }

      \JsonConfig::instance()->createConfiguration($cfg);
      $this->response->success();

   }



}
