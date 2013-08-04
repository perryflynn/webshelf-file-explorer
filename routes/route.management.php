<?php

use Symfony\Component\HttpFoundation\Request;

// Create a controller
$mm = $app['controllers_factory'];


$mm->get('/featurelist', function()
   {
      $features = array("delete", "upload", "mkdir", "copy", "move_rename", "download");
      $shares = \JsonConfig::instance()->getUserShares();

      $result = array();
      foreach($features as $feature) {
         foreach($shares as $share)
         {
            $gprop = null;
            try {
               $gprop = \JsonConfig::instance()->getSetting($feature);
            } catch(\Exception $ex) {
               $gprop = true;
            }
            $prop = null;
            try {
               $prop = \JsonConfig::instance()->hasUserShareProperty($share, $feature, true);
            } catch(\Exception $ex) {
               $prop = false;
            }

            if($prop===true && $gprop===true) {
               $result[$feature] = true;
               break;
            } else {
               $result[$feature] = false;
            }
         }
      }

      $settings = array("imageviewer");
      foreach($settings as $setting) {
         try {
            $result[$setting] = \JsonConfig::instance()->getSetting($setting);
         } catch(\Exception $ex) {
            $result[$setting] = false;
         }
      }

      return \Helper\response(true)->setResult($result);
   }
);


$app->mount('/management', $mm);
