<?php

namespace Controller;

class FilesystemController extends BaseController {

   private function is_allowed($filter, $path) {
      if($filter=="folders" && is_dir($path)) {
         return true;
      } elseif($filter=="files" && is_file($path)) {
         return true;
      } elseif($filter=="all" && (is_file($path) || is_dir($path))) {
         return true;
      } else {
         return false;
      }
   }

   protected function getfilesAction()
   {
      $node = null;
      $path = null;
      try {
         $node = $this->request->getGetArg("node");
         if($node=="root") {
            throw new Exception("Use path!");
         } else {
            $path = $node;
         }
      } catch(Exception $ex) {
         $path = $this->request->getGetArg("path");
      }

      $path = BASE."/".$path;
      $path = realpath($path);
      $file = null;

      $filter = $this->request->getGetArg("filter");
      if(!in_array($filter, array("all", "files", "folders"))) {
         $filter = "all";
      }

      if(is_dir($path)) {
         $path = $path."/";
      }

      if($path!==false && preg_match('/^'.preg_quote(BASE, '/').'/', $path)===1) {
         if(is_file($path)) {
            $path = dirname($path)."/";
            $file = basename($path);
         }

         $filebase = str_replace(BASE, "", $path);
         $filebase = (empty($filebase) ? "/" : $filebase);

         $files = @scandir($path);

         $result = array();
         if(is_array($files) && count($files)>0) {
            foreach($files as $file) {
               if($file!="." && $file!=".." && $this->is_allowed($filter, $path."/".$file)) {

                  $folders = -1;
                  $files = -1;
                  if(is_dir(BASE.$filebase.$file)) {
                     $folders = 0;
                     $files = 0;
                     $childs = scandir(BASE.$filebase.$file);
                     foreach($childs as $child) {
                        $absfile = BASE.$filebase.$file."/".$child;
                        if($child!="." && $child!="..") {
                           if(is_file($absfile)) {
                              $files++;
                           } elseif(is_dir($absfile)) {
                              $folders++;
                           }
                        }
                     }
                  }

                  $absfile = BASE.$filebase.$file;
                  $result[] = array(
                      "id" => "/".trim($filebase.$file, "/")."/",
                      "text" => $file,
                      "leaf" => false,
                      "children" => array(
                         "folders" => $folders,
                         "files" => $files
                      ),
                      "metadata" => array(
                          "atime" => date("Y-m-d H:i", fileatime($absfile)),
                          "ctime" => date("Y-m-d H:i", filectime($absfile)),
                          "mtime" => date("Y-m-d H:i", filemtime($absfile)),
                          "size" => filesize($absfile),
                          "extension" => (is_array(explode(".", $file)) && count(explode(".", $file))>0 ? end(explode(".", $file)) : ""),
                          "url" => "files/".$filebase.$file,
                          "fqdnurl" => ($_SERVER['SERVER_PORT']==443 ? "https://" : "http://").str_replace("//", "/", trim($_SERVER['SERVER_NAME'], "/")."/".
                              trim(dirname($_SERVER['PHP_SELF']), "/")."/files/".$filebase.$file),
                      ),
                      "qtip" => $folders." Folders, ".$files." Files"
                  );

               }
            }
         }

         if($node=="root") {
            $result = array(
               "id" => "/",
               "text" => "/",
               "leaf" => false,
               "children" => $result
            );
         }

         $this->response->success();
         $this->response->setResult($result);

      }








   }

}
