<?php

namespace Controller;

class ManagementController extends BaseController {

   protected function savesettingsAction()
   {
      if(!\JsonConfig::instance()->isAdmin()) {
         $this->response->failure();
         $this->response->setMessage("Forbidden.");
         return;
      }

      $cfg = \JsonConfig::instance()->loadConfiguration();
      $skel = \JsonConfig::instance()->getSkeleton();
      $settings = $skel['settings'];

      //--> UI Theme
      try {
         $ui = $this->request->getPostArg("uitheme");
         if(!in_array($ui, array("classic", "gray", "neptune", "access"))) {
            $ui = "gray";
         }
         $settings['uitheme'] = $this->request->getPostArg("uitheme");
      } catch(Exception $ex) {  }

      try { $settings['windowwidth'] = ((int)$this->request->getPostArg("windowwidth")); } catch(Exception $ex) {  }
      try { $settings['windowheight'] = ((int)$this->request->getPostArg("windowheight")); } catch(Exception $ex) {  }
      try { $settings['upload_maxsize'] = ((int)$this->request->getPostArg("upload_maxsize")); } catch(Exception $ex) {  }
      try { $settings['upload'] = ($this->request->getPostArg("upload")=="true"); } catch(Exception $ex) {  }
      try { $settings['copy'] = ($this->request->getPostArg("copy")=="true"); } catch(Exception $ex) {  }
      try { $settings['delete'] = ($this->request->getPostArg("delete")=="true"); } catch(Exception $ex) {  }
      try { $settings['mkdir'] = ($this->request->getPostArg("mkdir")=="true"); } catch(Exception $ex) {  }
      try { $settings['move_rename'] = ($this->request->getPostArg("move_rename")=="true"); } catch(Exception $ex) {  }
      try { $settings['imageviewer'] = ($this->request->getPostArg("imageviewer")=="true"); } catch(Exception $ex) {  }
      try { $settings['about_content'] = $this->request->getPostArg("about_content"); } catch(Exception $ex) {  }

      $cfg['settings'] = $settings;

      \JsonConfig::instance()->createConfiguration($cfg);
      $this->response->success();

   }

   protected function getsettingsAction()
   {
      $settings = \JsonConfig::instance()->getSettings();

      $result = array();
      foreach($settings as $name => $value) {
         $name = "args[".$name."]";
         $result[$name] = $value;
      }

      $this->response->setResult($result);
      $this->response->success();
   }

   protected function getfeaturelistAction()
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

      $this->response->success();
      $this->response->setResult($result);
   }

}
