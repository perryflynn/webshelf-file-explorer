<?php

use Symfony\Component\HttpFoundation\Request;

// Create a controller
$auth = $app['controllers_factory'];


$auth->get('/userstatus', function()
   {
      $response = null;
      try {
         $user = \JsonConfig::instance()->getUser();
         $response = array(
             "username" => \JsonConfig::instance()->getSessionUsername(),
             "loggedin" => true,
             "admin" => $user['admin'],
             "groups" => $user['groups'],
         );
      } catch(\Exception $ex) {
         $response = array(
             "username" => null,
             "loggedin" => false,
             "admin" => false,
             "groups" => array(),
         );
      }
      return Helper\response(true)->setResult($response);
   }
);


$auth->post('/login', function(Request $request)
   {
      $username = $request->get("username");
      $password = sha1($request->get("password"));

      try {
         $user = \JsonConfig::instance()->getUser($username);
         if($user['password']==$password) {
            \JsonConfig::instance()->setSessionUsername($username);
            return Helper\response(true)->setResult(true);
         } else {
            throw new Exception("fail");
         }
      } catch(\Exception $ex) {
         return Helper\response(false)->setResult(false);
      }
   }
);


$auth->get('/logout', function()
   {
      \JsonConfig::instance()->setSessionUsername(null);
      return Helper\response(true)->setResult(true);
   }
);


$auth->get('/grouplist', function()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(true)->setMessage("Forbidden");
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

      return Helper\response(true)->setResult($result);
   }
);


$auth->post('/groupsharelist', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $groupname = $request->get("group");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->groupExist($groupname)) {
         return Helper\response(false);
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

      return Helper\response(true)->setResult($result);
   }
);


$auth->post('/deleteshare', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $share = $request->get("share");
      $group = $request->get("group");

      if(!\JsonConfig::instance()->groupExist($group))
      {
         return Helper\response(false);
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
         return Helper\response(true);
      } else {
         return Helper\response(false);
      }
   }
);


$auth->post('/updateshare', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $group = $request->get("group");
      $path = $request->get("path");
      $read = $request->get("read");
      $protected = $request->get("protected");
      $upload = $request->get("upload");
      $mkdir = $request->get("mkdir");
      $copy = $request->get("copy");
      $move_rename = $request->get("move_rename");
      $download = $request->get("download");
      $delete = $request->get("delete");

      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->groupExist($group) || empty($group) || empty($path)) {
         return Helper\response(false);
      }

      if(strpos($path, "/")!==false) {
         return Helper\response(false)->setMessage("Illegal character in share name");
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
      return Helper\response(true);
   }
);


$auth->post('/addgroup', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $group = $request->get("group");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(empty($group)) {
         return Helper\response(false);
      }

      if(isset($cfg['groups'][$group])) {
         return Helper\response(false);
      } else {
         $cfg['groups'][$group] = array("shares" => array());
         \JsonConfig::instance()->createConfiguration($cfg);
         return Helper\response(true);
      }
   }
);


$auth->post('/deletegroup', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $group = $request->get("group");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->groupExist($group)) {
         return Helper\response(false);
      }

      $hitcount = 0;
      foreach($cfg['users'] as &$userdata) {
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
         return Helper\response(true);
      } else {
         return Helper\response(false);
      }
   }
);


$auth->get('/userlist', function()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
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

      return Helper\response(true)->setResult($result);
   }
);


$auth->post('/setpassword', function(Request $request)
   {
      $username = $request->get('username');
      $password = $request->get('password');
      $actuser = \JsonConfig::instance()->getSessionUsername();
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->isAdmin() && $username!=\JsonConfig::instance()->getSessionUsername()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      if(!\JsonConfig::instance()->userExist($username)) {
         return Helper\response(false);
      }

      if(($actuser==$username || \JsonConfig::instance()->isAdmin()) &&
         \JsonConfig::instance()->userExist($username))
      {
         $cfg['users'][$username]['password'] = sha1($password);
         \JsonConfig::instance()->createConfiguration($cfg);
         return Helper\response(true);
      }
      else
      {
         return Helper\response(false);
      }
   }
);


$auth->post('/updateuser', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $username = $request->get("username");
      $admin = ($request->get("admin")=="true" ? true : false);
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(empty($username)) {
         return Helper\response(false);
      }

      if(isset($cfg['users'][$username])) {
         $cfg['users'][$username]['admin'] = $admin;
      } else {
         $cfg['users'][$username] = array("admin"=>$admin, "password"=>"", "groups"=>array());
      }

      \JsonConfig::instance()->createConfiguration($cfg);
      return Helper\response(true);
   }
);


$auth->post('/deleteuser', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $username = $request->get("username");
      $actuser = \JsonConfig::instance()->getSessionUsername();
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->userExist($username)) {
         return Helper\response(false);
      }

      if($actuser==$username) {
         return Helper\response(false);
      } else {
         unset($cfg['users'][$username]);
         \JsonConfig::instance()->createConfiguration($cfg);
         return Helper\response(true);
      }
   }
);


$auth->post('/usergrouplist', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $username = $request->get("username");
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->userExist($username)) {
         return Helper\response(false);
      }

      $result = array();
      foreach($cfg['groups'] as $name => $data)
      {
         $result[] = array(
            "name" => $name,
            "member" => (in_array($name, $cfg['users'][$username]['groups'])),
         );
      }

      return Helper\response(true)->setResult($result);
   }
);


$auth->post('/changegroupmembership', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $username = $request->get("username");
      $group = $request->get("group");
      $memberof = ($request->get("memberof")=="true" ? true : false);
      $cfg = \JsonConfig::instance()->loadConfiguration();

      if(!\JsonConfig::instance()->groupExist($group) ||
         !\JsonConfig::instance()->userExist($username))
      {
         return Helper\response(false);
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
      return Helper\response(true);
   }
);



$app->mount('/authentication', $auth);
