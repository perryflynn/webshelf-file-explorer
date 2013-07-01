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

   public function getShareFromPath($path) {
      $path = realpath($path).DIRECTORY_SEPARATOR;
      $rgx = "/^".preg_quote(BASE, "/")."(.*?)".preg_quote(DIRECTORY_SEPARATOR, "/")."/";
      $result = preg_match($rgx, $path, $match);
      if($result!==1) {
         throw new Exception("Share can't extracted");
      }
      return $match[1];
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
      $share = $this->getShareFromPath($path);

      $final = ($typefilter && in_array($share, $shares));
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
            case "mp3":
               $mime = "audio/mp3"; break;
            case "wav":
               $mime = "audio/wav"; break;
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
         header("Content-Length: ".filesize(BASE.$file), true);
         if($download) {
            header('Content-Disposition: attachment; filename="'.basename($file).'"');
         }

         $handle = fopen(BASE.$file, "r");
         while (!feof($handle)) {
            echo fread($handle, 1024);
         }
         fclose($handle);

         exit();

      }
   }

   protected function uploadAction()
   {
      if(\JsonConfig::instance()->getSetting("upload")!==true) {
         $this->response->failure();
         $this->response->setMessage("Upload not enabled");
         return;
      }

      // Request parameters
      $method = $this->request->getServerArg("REQUEST_METHOD");
      $length = $this->request->getServerArg("CONTENT_LENGTH");
      $maxsize = \JsonConfig::instance()->getSetting("upload_maxsize")*1024*1024;
      $targetpath = $this->request->getGetArg("targetpath");

      // Request headers
      $reqwith = $this->request->getServerArg("HTTP_X_REQUESTED_WITH");
      $xfilename = $this->request->getServerArg("HTTP_X_FILE_NAME");
      $xmimetype = $this->request->getServerArg("HTTP_X_FILE_TYPE");

      // Scurity stuff
      if($method!="PUT") {
         $this->response->failure();
         $this->response->setMessage("Bad Request: PUT expected");
         return;
      }

      if($reqwith!="XMLHttpRequest") {
         $this->response->failure();
         $this->response->setMessage("Bad Request: XMLHttpRequest required");
         return;
      }

      if($length>$maxsize) {
         $this->response->failure();
         $this->response->setMessage("Bad Request: Content length larger than ".$maxsize." Bytes");
         return;
      }

      // Check share permissions
      $path = BASE.$targetpath;
      $targetshare = $this->getShareFromPath($path);

      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "upload", true)==false) {
         $this->response->failure();
         $this->response->setMessage("Operation not allowed");
         return;
      }

      // Make filenames
      $search = array("ä", "ü", "ö", "ß", "€", "Ä", "Ü", "Ö");
      $replace = array("ae", "ue", "oe", "ss", "euro", "Ae", "Ue", "Oe");
      $xfilename = str_replace($search, $replace, $xfilename);
      $xfilename = preg_replace("/[^A-Za-z0-9_\-\.]/", "_", $xfilename);
      $targetfile = $path."/".$xfilename;
      if(is_file($targetfile)) {
         $targetfile = $path."/".substr(sha1(microtime(true)."-"), -8)."_".$xfilename;
      }

      // Upload!
      $putdata = fopen("php://input", "r");
      $fp = fopen($targetfile, "w");
      while ($data = fread($putdata, 1024)) {
         fwrite($fp, $data);
      }
      fclose($fp);
      fclose($putdata);

      $this->response->success();
   }

   protected function getfilesAction()
   {
      $node = $this->request->getGetArg("node");
      $path = BASE.trim($node, "/")."/";

      $showhidden = null;
      try {
         $showhidden = ($this->request->getGetArg("showhidden")=="true");
      } catch(\Exception $ex) {
         $showhidden = false;
      }

      // Build tree
      if($node=="root") {
         $shares = \JsonConfig::instance()->getUserShares();
         asort($shares);

         $result = array();
         foreach($shares as $share) {

            $globalupload = \JsonConfig::instance()->getSetting("upload");
            $shareupload = \JsonConfig::instance()->hasUserShareProperty($share, "upload", true);
            $globalmkdir = \JsonConfig::instance()->getSetting("mkdir");
            $sharemkdir = \JsonConfig::instance()->hasUserShareProperty($share, "mkdir", true);
            $globaldelete = \JsonConfig::instance()->getSetting("delete");
            $sharedelete = \JsonConfig::instance()->hasUserShareProperty($share, "delete", true);

            $result[] = array(
               "id" => DIRECTORY_SEPARATOR.$share.DIRECTORY_SEPARATOR,
               "text" => $share,
               "leaf" => false,
               "children" => $result,
               "iconCls" => (\JsonConfig::instance()->isSharePublic($share) ? "iconcls-share" : "iconcls-usershare"),

                "can_upload" => ($globalupload && $shareupload),
                "can_mkdir" => ($globalmkdir && $sharemkdir),
                "can_delete" => ($globaldelete && $sharedelete),
                "is_share" => true,

            );
         }

         $this->response->setResult($result);
         $this->response->success();

      }

      else if(is_dir($path)) {

         // Check Protection
         $sharename = $this->getShareFromPath($path);
         $ifprotected = \JsonConfig::instance()->isShareProtected($sharename);

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

                     // Protection
                     if($ifprotected==true)
                     {
                        $url = "ajax.php?controller=filesystem&action=download&args[file]=".urlencode($filebase.$file);
                        $fqdnurl = ($_SERVER['SERVER_PORT']==443 ? "https://" : "http://").
                              str_replace("//", "/", str_replace(DIRECTORY_SEPARATOR, "/", trim($_SERVER['SERVER_NAME'], "/").
                              trim(dirname($_SERVER['PHP_SELF'])."/", "/")."/ajax.php?controller=filesystem&action=download&args[file]=".urlencode($filebase.$file)));
                     }
                     else
                     {
                        $url = basename(BASE)."/".$filebase.$file;
                        $fqdnurl = ($_SERVER['SERVER_PORT']==443 ? "https://" : "http://").
                              str_replace("//", "/", str_replace(DIRECTORY_SEPARATOR, "/", trim($_SERVER['SERVER_NAME'], "/").
                              dirname($_SERVER['PHP_SELF'])."/".basename(BASE)."/".$filebase.$file));
                     }

                     $globalupload = \JsonConfig::instance()->getSetting("upload");
                     $shareupload = \JsonConfig::instance()->hasUserShareProperty($sharename, "upload", true);
                     $globalmkdir = \JsonConfig::instance()->getSetting("mkdir");
                     $sharemkdir = \JsonConfig::instance()->hasUserShareProperty($sharename, "mkdir", true);
                     $globaldelete = \JsonConfig::instance()->getSetting("delete");
                     $sharedelete = \JsonConfig::instance()->hasUserShareProperty($sharename, "delete", true);

                     if(substr(basename($file), 0, 1)!="." || $showhidden==true) {

                        // Result
                        $absfile = BASE.$filebase.$file;

                        $id = DIRECTORY_SEPARATOR.trim($filebase.$file, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
                        if(is_file($absfile)) {
                           $id = DIRECTORY_SEPARATOR.trim($filebase.$file, DIRECTORY_SEPARATOR);
                        }

                        $result[] = array(
                            "id" => $id,
                            "text" => $file,
                            "leaf" => ($folders>0 ? false : true),
                            "iconCls" => "iconcls-folder",
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
                                "url" => $url,
                                "fqdnurl" => $fqdnurl,
                            ),
                            "qtip" => $folders." Folders, ".$files." Files",

                            "can_upload" => ($globalupload && $shareupload),
                            "can_mkdir" => ($globalmkdir && $sharemkdir),
                            "can_delete" => ($globaldelete && $sharedelete),
                            "is_share" => false,

                        );

                     }

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

   protected function sharelistAction()
   {
      $files = glob(BASE."*");
      $result = array();
      foreach($files as $file) {
         if($file!="." && $file!=".." && is_dir($file)) {
            $result[] = array(
                "name" => basename($file),
            );
         }
      }

      $this->response->success();
      $this->response->setResult($result);
   }

   protected function createdirectoryAction()
   {
      if(\JsonConfig::instance()->getSetting("mkdir")!==true) {
         $this->response->failure();
         $this->response->setMessage("Mkdir not enabled");
         return;
      }

      $targetfolder = $this->request->getPostArg("targetfolder");
      $newfolder = $this->request->getPostArg("newfolder");

      $path = BASE.$targetfolder."/";
      if(is_file($path)) {
         $path = dirname($path);
      }

      $targetshare = $this->getShareFromPath($path);

      // Check permissions
      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "mkdir", true)==false) {
         $this->response->failure();
         $this->response->setMessage("Operation not allowed");
         return;
      }

      // Prepare name
      $search = array("ä", "ü", "ö", "ß", "€", "Ä", "Ü", "Ö");
      $replace = array("ae", "ue", "oe", "ss", "euro", "Ae", "Ue", "Oe");
      $newfolder = str_replace($search, $replace, $newfolder);
      $newfolder = preg_replace("/[^A-Za-z0-9_\-\.]/", "_", $newfolder);
      $newfoldername = $path."/".$newfolder;
      if(is_dir($newfoldername)) {
         $newfoldername = $path."/".substr(sha1(microtime(true)."-"), -8)."_".$newfolder;
      }

      $result = mkdir($newfoldername, 0755);

      if($result) {
         $this->response->success();
      } else {
         $this->response->failure();
         $this->response->setMessage("Folder creation failed.");
      }

   }

   protected function deletefileAction()
   {
      if(\JsonConfig::instance()->getSetting("delete")!==true) {
         $this->response->failure();
         $this->response->setMessage("Delete not enabled");
         return;
      }

      $filepath = $this->request->getPostArg("filepath");
      $path = BASE.$filepath;
      $targetshare = $this->getShareFromPath($path);

      // Check permissions
      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "delete", true)==false) {
         $this->response->failure();
         $this->response->setMessage("Operation not allowed");
         return;
      }

      try {
         \Util\File::deleteRecusive($path);
         $this->response->success();
      } catch(\Exception $ex) {
         $this->response->failure();
         $this->response->setMessage("Delete failed.");
      }

   }

}
