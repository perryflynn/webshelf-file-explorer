<?php

use Symfony\Component\HttpFoundation\Request;

// Create a controller
$auth = $app['controllers_factory'];


$auth->get('userstatus', function()
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


$app->mount('/authentication', $auth);
