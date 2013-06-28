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
      try { $settings['upload'] = ($this->request->getPostArg("upload")=="true"); } catch(Exception $ex) {  }
      try { $settings['copy'] = ($this->request->getPostArg("copy")=="true"); } catch(Exception $ex) {  }
      try { $settings['delete'] = ($this->request->getPostArg("delete")=="true"); } catch(Exception $ex) {  }
      try { $settings['move_rename'] = ($this->request->getPostArg("move_rename")=="true"); } catch(Exception $ex) {  }
      try { $settings['about_content'] = $this->request->getPostArg("about_content"); } catch(Exception $ex) {  }

      $cfg['settings'] = $settings;

      \JsonConfig::instance()->createConfiguration($cfg);
      $this->response->success();

   }

   protected function getsettingsAction()
   {
      $skel = \JsonConfig::instance()->getSkeleton();
      $cfg = \JsonConfig::instance()->loadConfiguration();
      $settings = $skel['settings'];
      if(isset($cfg['settings'])) {
         $settings = $cfg['settings'];
      }

      $result = array();
      foreach($settings as $name => $value) {
         $name = "args[".$name."]";
         $result[$name] = $value;
      }

      $this->response->setResult($result);
      $this->response->success();
   }

}
