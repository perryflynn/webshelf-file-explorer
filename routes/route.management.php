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

      $settings = array("imageviewer", "thumbnailmouseover");
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


$mm->post('/savesettings', function(Request $request)
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         return Helper\response(false)->setMessage("Forbidden");
      }

      $cfg = \JsonConfig::instance()->loadConfiguration();
      $skel = \JsonConfig::instance()->getSkeleton();
      $settings = $skel['settings'];

      //--> UI Theme
      try {
         $ui = $request->get("uitheme");
         if(!in_array($ui, array("classic", "gray", "neptune", "access"))) {
            $ui = "gray";
         }
         $settings['uitheme'] = $request->get("uitheme");
      } catch(Exception $ex) {  }

      try { $settings['windowwidth'] = ((int)$request->get("windowwidth")); } catch(Exception $ex) {  }
      try { $settings['windowheight'] = ((int)$request->get("windowheight")); } catch(Exception $ex) {  }
      try { $settings['upload_maxsize'] = ((int)$request->get("upload_maxsize")); } catch(Exception $ex) {  }
      try { $settings['upload'] = ($request->get("upload")=="true"); } catch(Exception $ex) {  }
      try { $settings['copy'] = ($request->get("copy")=="true"); } catch(Exception $ex) {  }
      try { $settings['delete'] = ($request->get("delete")=="true"); } catch(Exception $ex) {  }
      try { $settings['mkdir'] = ($request->get("mkdir")=="true"); } catch(Exception $ex) {  }
      try { $settings['move_rename'] = ($request->get("move_rename")=="true"); } catch(Exception $ex) {  }
      try { $settings['imageviewer'] = ($request->get("imageviewer")=="true"); } catch(Exception $ex) {  }
      try { $settings['about_content'] = $request->get("about_content"); } catch(Exception $ex) {  }
      try { $settings['thumbnailmouseover'] = ($request->get("thumbnailmouseover")=="true"); } catch(Exception $ex) {  }

      $cfg['settings'] = $settings;

      \JsonConfig::instance()->createConfiguration($cfg);
      return \Helper\response(true);
   }
);


$mm->get('/getsettings', function()
   {
      $settings = \JsonConfig::instance()->getSettings();

      $result = array();
      foreach($settings as $name => $value) {
         $result[$name] = $value;
      }

      return Helper\response(true)->setResult($result);
   }
);


$mm->get('/thumbnailstatus', function() use($app)
{
   $thumbfolder = ROOT."thumbnails".DIRECTORY_SEPARATOR;
   $files = glob($thumbfolder."*");

   $size = 0;
   $count = 0;
   foreach($files as $file)
   {
      $size += filesize($file);
      $count++;
   }

   return Helper\response(true)->setResult(array("size"=>$size, "count"=>$count));
});


$mm->get('/deletethumbnailcache', function() use($app)
{
   if(!\JsonConfig::instance()->isAdmin()) {
      return Helper\response(false)->setMessage("Forbidden");
   }

   $thumbfolder = ROOT."thumbnails".DIRECTORY_SEPARATOR;
   $files = glob($thumbfolder."*");

   foreach($files as $file)
   {
      @unlink($file);
   }

   return Helper\response(true);
});


$app->mount('/management', $mm);
