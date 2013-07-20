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
         if(!(file_exists(BASE.$share) && is_dir(BASE.$share))) {
            @mkdir(BASE.$share, 0775);
            if(\JsonConfig::instance()->isShareProtected($share)) {
               $accessfile = BASE.$share.DIRECTORY_SEPARATOR.".htaccess";
               @file_put_contents($accessfile, "\ndeny from all\n", FILE_APPEND);
            }
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

   private function getUniqName($file) {
      $path = dirname($file)."/";
      $xfilename = basename($file);

      $search = array("ä", "ü", "ö", "ß", "€", "Ä", "Ü", "Ö");
      $replace = array("ae", "ue", "oe", "ss", "euro", "Ae", "Ue", "Oe");
      $xfilename = str_replace($search, $replace, $xfilename);
      $xfilename = preg_replace("/[^A-Za-z0-9_\-\.]/", "_", $xfilename);
      $targetfile = $path."/".$xfilename;
      $namecount = 0;

      while(file_exists($targetfile)) {
         $namecount++;
         preg_match("/^([^\.]*)(?:\.(.*?))?\$/", $xfilename, $filenameparts);
         unset($filenameparts[0]);
         $targetfile = $path."/".$filenameparts[1]."_".$namecount.(isset($filenameparts[2]) ? ".".$filenameparts[2] : "");
      }

      return $targetfile;
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
               $mime = "image/jpeg"; break;
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
      
      // Try to disable time_limit
      if(function_exists("set_time_limit")) {
         set_time_limit(0);
      }

      // Request parameters
      $method = $this->request->getServerArg("REQUEST_METHOD");
      $length = $this->request->getServerArg("CONTENT_LENGTH");
      $maxsize = \JsonConfig::instance()->getSetting("upload_maxsize")*1024*1024;
      $targetpath = $this->request->getGetArg("targetpath");

      // Request headers
      $reqwith = $this->request->getServerArg("HTTP_X_REQUESTED_WITH");
      $xfilename = $this->request->getServerArg("HTTP_X_FILE_NAME");
      //$xmimetype = $this->request->getServerArg("HTTP_X_FILE_TYPE");

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
         $this->response->setMessage("Bad Request: Content length larger than ".($maxsize/1024/1024)." MB");
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
      $targetfile = $this->getUniqName($path."/".$xfilename);

      // Upload!
      $stepsize = 1024;
      $progress_size = 0;

      $putdata = fopen("php://input", "r");
      $fp = fopen($targetfile, "w");
      while ($data = fread($putdata, $stepsize)) {
         fwrite($fp, $data);
         $progress_size += $stepsize;

         // Check max filesize, detect incorrect content-length
         if($progress_size>$maxsize) {
            break;
         }
      }
      fclose($fp);
      fclose($putdata);

      // Final checks
      if($progress_size>$maxsize || $progress_size<$length) {
         if(is_file($targetfile)) {
            unlink($targetfile);
         }

         $this->response->failure();
         if($progress_size>$maxsize) {
            $this->response->setMessage("File (".($length/1024/1024)." MB) bigger than ".($maxsize/1024/1024)." MB");
         } else {
            $this->response->setMessage(number_format($length>0 ? ($length/1024/1024) : 0, 2)." MB expected, ".
                  number_format($progress_size>0 ? ($progress_size/1024/1024) : 0, 2)." MB written. Unknown error.");
         }

      } else {
         $this->response->success();
      }


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

      $regex = null;
      try {
         $regex = $this->request->getGetArg("regex");
      } catch(\Exception $ex) {
         $regex = null;
      }

      // Build tree
      if($node=="root") {
         $shares = \JsonConfig::instance()->getUserShares();
         asort($shares);

         $result = array();
         foreach($shares as $share) {

            // Upload
            $globalupload = \JsonConfig::instance()->getSetting("upload");
            $shareupload = \JsonConfig::instance()->hasUserShareProperty($share, "upload", true);

            // Mkdir
            $globalmkdir = \JsonConfig::instance()->getSetting("mkdir");
            $sharemkdir = \JsonConfig::instance()->hasUserShareProperty($share, "mkdir", true);

            // Copy
            $globalcopy = \JsonConfig::instance()->getSetting("copy");
            $sharecopy = \JsonConfig::instance()->hasUserShareProperty($share, "copy", true);

            // Move/Rename
            $globalmoverename = \JsonConfig::instance()->getSetting("move_rename");
            $sharemoverename = \JsonConfig::instance()->hasUserShareProperty($share, "move_rename", true);

            // Delete
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
                "can_copy" => ($globalcopy && $sharecopy),
                "can_move_rename" => ($globalmoverename && $sharemoverename),
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

                  if(!is_null($regex)) {
                     if(preg_match($regex, $file)!==1) {
                        continue;
                     }
                  }

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

                     // Upload
                     $globalupload = \JsonConfig::instance()->getSetting("upload");
                     $shareupload = \JsonConfig::instance()->hasUserShareProperty($sharename, "upload", true);

                     // Mkdir
                     $globalmkdir = \JsonConfig::instance()->getSetting("mkdir");
                     $sharemkdir = \JsonConfig::instance()->hasUserShareProperty($sharename, "mkdir", true);

                     // Delete
                     $globaldelete = \JsonConfig::instance()->getSetting("delete");
                     $sharedelete = \JsonConfig::instance()->hasUserShareProperty($sharename, "delete", true);

                     // Copy
                     $globalcopy = \JsonConfig::instance()->getSetting("copy");
                     $sharecopy = \JsonConfig::instance()->hasUserShareProperty($sharename, "copy", true);

                     // Move/Rename
                     $globalmoverename = \JsonConfig::instance()->getSetting("move_rename");
                     $sharemoverename = \JsonConfig::instance()->hasUserShareProperty($sharename, "move_rename", true);


                     if(substr(basename($file), 0, 1)!="." || $showhidden==true) {

                        // Result
                        $absfile = BASE.$filebase.$file;

                        $id = DIRECTORY_SEPARATOR.trim($filebase.$file, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;
                        $parent = dirname($id)."/";

                        if(is_file($absfile)) {
                           $id = DIRECTORY_SEPARATOR.trim($filebase.$file, DIRECTORY_SEPARATOR);
                        }

                        $result[] = array(
                            "id" => $id,
                            "text" => $file,
                            "leaf" => false, //($folders>0 ? false : true),
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

                            "parent" => $parent,
                            "can_upload" => ($globalupload && $shareupload),
                            "can_mkdir" => ($globalmkdir && $sharemkdir),
                            "can_delete" => ($globaldelete && $sharedelete),
                            "can_copy" => ($globalcopy && $sharecopy),
                            "can_move_rename" => ($globalmoverename && $sharemoverename),
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

      $path = BASE.$targetfolder;
      if(is_file($path)) {
         $path = dirname($path);
      }
      $path = $path."/";

      $targetshare = $this->getShareFromPath($path);

      // Check permissions
      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "mkdir", true)==false) {
         $this->response->failure();
         $this->response->setMessage("Operation not allowed");
         return;
      }

      // Prepare name
      $newfoldername = $this->getUniqName($path."/".$newfolder);

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

   protected function fileoperationAction() {
      $operation = $this->request->getPostArg("operation");
      $filepath = $this->request->getPostArg("filepath");
      $target = $this->request->getPostArg("target");

      if(!in_array($operation, array("copy", "move"))) {
         $this->response->failure();
         $this->response->setMessage("Unknown operation");
         return;
      }

      $permission = $operation;
      if($permission=="move") {
         $permission = "move_rename";
      }

      $sourcepath = BASE.$filepath;
      $targetpath = BASE.$target;

      $sourceshare = $this->getShareFromPath($sourcepath);
      $targetshare = $this->getShareFromPath($targetpath);

      $rglobal = \JsonConfig::instance()->getSetting($permission);
      $rsharesorce = \JsonConfig::instance()->hasUserShareProperty($sourceshare, $permission, true);
      $rsharetarget = \JsonConfig::instance()->hasUserShareProperty($targetshare, $permission, true);

      if($rglobal==false || $rsharesorce==false || $rsharetarget==false) {
         $this->response->failure();
         if($rglobal==true) {
            $this->response->setMessage(basename($sourcepath).": Operation not allowed in/between this shares");
         } else {
            $this->response->setMessage(basename($sourcepath).": Operation disabled");
         }
         return;
      }

      if(!is_dir($sourcepath) && !is_file($sourcepath)) {
         $this->response->failure();
         $this->response->setMessage(basename($sourcepath).": Source not exist");
         return;
      }

      if(!is_dir($targetpath)) {
         $this->response->failure();
         $this->response->setMessage(basename($sourcepath).": Target not exist");
         return;
      }

      if(file_exists($targetpath.DIRECTORY_SEPARATOR.basename($sourcepath))) {
         $this->response->failure();
         $this->response->setMessage(basename($sourcepath).": Target already exist");
         return;
      }

      $methodname = "r".$operation;
      $result = \Util\File::$methodname($sourcepath, $targetpath);
      if($result) {
         $this->response->success();
      } else {
         $this->response->failure();
      }

   }

   protected function renamefileAction()
   {
      $file = $this->request->getPostArg("file");
      $newname = preg_replace("/[^A-Za-z0-9\-_\.]/", "_", $this->request->getPostArg("newname"));

      $sourcefile = realpath(BASE.$file);
      $targetfile = dirname($sourcefile).DIRECTORY_SEPARATOR.$newname;
      $share = $this->getShareFromPath($sourcefile);

      $rglobal = \JsonConfig::instance()->getSetting("move_rename");
      $rsharesorce = \JsonConfig::instance()->hasUserShareProperty($share, "move_rename", true);

      if($rglobal!=true || $rsharesorce!=true) {
         $this->response->failure();
         $this->response->setMessage("Rename not allowed");
         return;
      }

      if(!file_exists($sourcefile)) {
         $this->response->failure();
         $this->response->setMessage("Sourcefile not exist");
         return;
      }

      if(file_exists($targetfile)) {
         $this->response->failure();
         $this->response->setMessage("Targetfile already exist");
         return;
      }

      $result = rename($sourcefile, $targetfile);
      if($result) {
         $this->response->success();
      } else {
         $this->response->failure();
         $this->response->setMessage("Rename from '".$sourcefile."' to '".$targetfile."' failed");
      }

   }

   protected function spaceinfoAction()
   {
      $path = $this->request->getGetArg("path");
      $abspath = realpath(BASE.$path);
      $share = $this->getShareFromPath($abspath);

      $rglobal = \JsonConfig::instance()->getSetting("upload");
      $rsharesorce = \JsonConfig::instance()->hasUserShareProperty($share, "upload", true);

      if($rglobal==false || $rsharesorce==false) {
         $this->response->failure();
         return;
      }

      $total = @disk_total_space($abspath)/1024/1024/1024;
      $free = @disk_free_space($abspath)/1024/1024/1024;

      if($total==false || $free==false) {
         $total = 0;
         $free = 0;
      }

      $used = $total-$free;

      $this->response->setResult(array(
          "total" => number_format($total, 2),
          "free" => number_format($free, 2),
          "used" => number_format($used, 2),
          "percent_used" => number_format((100/$total*$used), 2),
          "percent_used_float" => round((100/$total*$used)/100, 3),
          "percent_free" => number_format((100/$total*$free), 2),
          "percent_free_float" => round((100/$total*$free)/100, 3),
      ));

      $this->response->success();

   }



}
