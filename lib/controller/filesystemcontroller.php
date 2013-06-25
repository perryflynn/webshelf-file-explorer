<?php

namespace Controller;

class FilesystemController extends BaseController {

   protected function init() 
   {
      $cfg = \JsonConfig::instance()->loadConfiguration();
      $sharelist = array();
      foreach($cfg['groups'] as $group) {
         foreach($group['shares'] as $share) {
            if(!in_array($share['path'], $sharelist)) {
               $sharelist[] = $share['path'];
            }
         }
      }
      
      foreach($sharelist as $share) {
         if(!(file_exists($share) && is_dir($share))) {
            @mkdir(BASE.$share, 0775);
         }
      }
      
   }

   private function is_allowed($filter, $path) {
      $path = realpath($path);
   
      // Filetype allowed?
      $typefilter = false;
      if($filter=="folders" && is_dir($path)) {
         $typefilter = true;
      } elseif($filter=="files" && is_file($path)) {
         $typefilter = true;
      } elseif($filter=="all" && (is_file($path) || is_dir($path))) {
         $typefilter = true;
      }
      
      // Share allowed?
      $shares = \JsonConfig::instance()->getUserShares();
      $rgx = "/^".preg_quote(BASE, "/")."(.*?)".preg_quote(DIRECTORY_SEPARATOR, "/")."/";
      $result = preg_match($rgx, $path, $match);
      
      $final = ($typefilter && $result===1 && in_array($match[1], $shares));
      return $final;
      
   }
   
   protected function downloadAction() 
   {
      $file = $this->request->getGetArg("file");
      if($this->is_allowed("files", BASE.$file)) {
         
         $download = false;
         $ext = end(explode(".", $file));
         $mime = null;
         switch($ext) {
            case "png": 
               $mime = "image/png"; break;
            case "jpg": 
               $mime = "image/jpg"; break;
            case "gif": 
               $mime = "image/gif"; break;
            case "html": 
               $mime = "text/html"; break;
            case "txt": 
            case "css": 
            case "js": 
            case "cs": 
            case "c": 
            case "cpp": 
            case "java": 
               $mime = "text/plain"; break;
            case "pdf": 
               $mime = "application/pdf"; break;
            default: 
               $download = true;
               $mime = "application/octet-stream"; break;
         }
         
         header("Content-Type: ".$mime, true);
         if($download) {
            header('Content-Disposition: attachment; filename="'.basename($file).'"');
         }
         readfile(BASE.$file);
         exit();
         
      }
   }

   protected function getfilesAction()
   {
      $node = $this->request->getGetArg("node");
      $path = BASE.DIRECTORY_SEPARATOR.$node;
      
      if($node=="root") {
         $shares = \JsonConfig::instance()->getUserShares();
         asort($shares);
         
         $result = array();
         foreach($shares as $share) {
            $result[] = array(
               "id" => DIRECTORY_SEPARATOR.$share.DIRECTORY_SEPARATOR,
               "text" => $share,
               "leaf" => false,
               "children" => $result,
               "iconCls" => "iconcls-share",
            );
         }
         
         $this->response->setResult($result);
         $this->response->success();
         
      }
      
      else if(is_dir($path)) {
      
         $result = array();
         $path = realpath($path);
         $file = null;

         $filter = $this->request->getGetArg("filter");
         if(!in_array($filter, array("all", "files", "folders"))) {
            $filter = "all";
         }

         if(is_dir($path)) {
            $path = $path.DIRECTORY_SEPARATOR;
         }
         
         if($path!==false && preg_match('/^'.preg_quote(BASE, '/').'/', $path)===1) {
            if(is_file($path)) {
               $path = dirname($path).DIRECTORY_SEPARATOR;
               $file = basename($path);
            }
            
            $filebase = str_replace(BASE, "", $path);
            $filebase = (empty($filebase) ? DIRECTORY_SEPARATOR : $filebase);

            $files = @scandir($path);

            if(is_array($files) && count($files)>0 && $node!="root") {
               foreach($files as $file) {
                  if($file!="." && $file!=".." && $this->is_allowed($filter, $path.DIRECTORY_SEPARATOR.$file)) {

                     $folders = -1;
                     $files = -1;
                     if(is_dir(BASE.$filebase.$file)) {
                        $folders = 0;
                        $files = 0;
                        $childs = scandir(BASE.$filebase.$file);
                        foreach($childs as $child) {
                           $absfile = BASE.$filebase.$file.DIRECTORY_SEPARATOR.$child;
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
                         "id" => DIRECTORY_SEPARATOR.trim($filebase.$file, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR,
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
                             "url" => "ajax.php?controller=filesystem&action=download&args[file]=".urlencode($filebase.$file),
                             "fqdnurl" => ($_SERVER['SERVER_PORT']==443 ? "https://" : "http://").
                                 str_replace("//", "/", str_replace(DIRECTORY_SEPARATOR, "/", trim($_SERVER['SERVER_NAME'], "/")."/".
                                 dirname($_SERVER['PHP_SELF'])."/ajax.php?controller=filesystem&action=download&args[file]=".urlencode($filebase.$file))),
                         ),
                         "qtip" => $folders." Folders, ".$files." Files"
                     );

                  }
               }
            }
         }
         
         $this->response->success();
         $this->response->setResult($result);

      } else {
         $this->response->failure();
      }

   }

}
