<?php

use Symfony\Component\HttpFoundation\Request;

// Create a controller
$fs = $app['controllers_factory'];

$fs->before(function ()
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
);


$fs->post('/getfiles', function(Request $request)
   {
      $node = $request->get("node");
      $showhidden = ($request->get("showhidden")=="true");
      $regex = $request->get("regex");

      $path = BASE.trim($node, "/")."/";

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

         return Helper\response(true)->setResult($result);

      }

      else if(is_dir($path)) {

         // Check Protection
         $sharename = FsTools\getShareFromPath($path);
         $ifprotected = \JsonConfig::instance()->isShareProtected($sharename);

         $result = array();
         $path = realpath($path);
         $file = null;

         $filter = $request->get("filter");
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
                     if(preg_match("/".$regex."/i", $file)!==1) {
                        continue;
                     }
                  }

                  if($file!="." && $file!=".." && FsTools\is_allowed($filter, $path.DIRECTORY_SEPARATOR.$file)) {

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

                     $protocol = ($_SERVER['SERVER_PORT']==443 ? "https://" : "http://");
                     $server = $_SERVER['HTTP_HOST'];
                     $urlpath = \FsTools\getBaseFolder();

                     // Protection
                     if($ifprotected==true) {
                        $url = "index.php/get/".$filebase.$file;
                     } else {
                        $url = basename(BASE)."/".$filebase.$file;
                     }

                     $fqdnurl = $protocol.$server.$urlpath.$url;
                     $thumburl = $protocol.$server.$urlpath."index.php/thumbnail/".$filebase.$file;

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


                        $isimage = false;
                        $image_width=null;
                        $image_height=null;
                        if(preg_match('/\.(png|jpg|jpeg|gif)$/i', $absfile)===1)
                        {
                           $res = @getimagesize($absfile);
                           if(is_array($res)) {
                              $isimage = true;
                              $image_width = $res[0];
                              $image_height = $res[1];
                           }
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
                                "atime" => date("Y-m-d H:i:s", fileatime($absfile)),
                                "ctime" => date("Y-m-d H:i:s", filectime($absfile)),
                                "mtime" => date("Y-m-d H:i:s", filemtime($absfile)),
                                "size" => filesize($absfile),
                                "isfile" => is_file($absfile),
                                "isdir" => is_dir($absfile),
                                "isimage" => $isimage,
                                "image_width" => $image_width,
                                "image_height" => $image_height,
                                "extension" => (strpos($file, ".")===false ? null : (is_array(explode(".", $file)) && count(explode(".", $file))>0 ? end(explode(".", $file)) : "")),
                                "url" => $url,
                                "fqdnurl" => $fqdnurl,
                                "thumbnailurl" => ($isimage ? $thumburl : null),
                            ),
                            "qtip" => $folders." Folders, ".$files." File".($files==1 ? "" : "s"),

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

         return Helper\response(true)->setResult($result);

      } else {
         return Helper\response(false);
      }

   }
);



$fs->post('/spaceinfo', function(Request $request)
   {
      $path = $request->get("path");
      $abspath = realpath(BASE.$path);
      $share = \FsTools\getShareFromPath($abspath);

      $rglobal = \JsonConfig::instance()->getSetting("upload");
      $rsharesorce = \JsonConfig::instance()->hasUserShareProperty($share, "upload", true);

      if($rglobal==false || $rsharesorce==false) {
         return Helper\response(false);
      }

      $total = @disk_total_space($abspath)/1024/1024/1024;
      $free = @disk_free_space($abspath)/1024/1024/1024;

      if($total==false || $free==false) {
         $total = 0;
         $free = 0;
      }

      $used = $total-$free;

      return Helper\response(true)->setResult(array(
          "total" => number_format($total, 2),
          "free" => number_format($free, 2),
          "used" => number_format($used, 2),
          "percent_used" => number_format((100/$total*$used), 2),
          "percent_used_float" => round((100/$total*$used)/100, 3),
          "percent_free" => number_format((100/$total*$free), 2),
          "percent_free_float" => round((100/$total*$free)/100, 3),
      ));

   }
);



$fs->get('/sharelist', function()
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
      return Helper\response(true)->setResult($result);
   }
);



$fs->post('/createdirectory', function(Request $request)
   {
      if(\JsonConfig::instance()->getSetting("mkdir")!==true) {
         return Helper\response(false)->setMessage("mkdir not enabled");
      }

      $newfolder = $request->get("newfolder");

      $path = BASE.ltrim($newfolder, DIRECTORY_SEPARATOR);
      if(is_file($path)) {
         $path = dirname($path);
      }
      $path = $path."/";

      $targetshare = FsTools\getShareFromPath($path);

      // Check permissions
      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "mkdir", true)==false) {
         return Helper\response(false)->setMessage("Operation not allowed");
      }

      // Prepare name
      $newfoldername = FsTools\getUniqName($path);

      $result = mkdir($newfoldername, 0755, true);

      if($result) {
         return Helper\response(true);
      } else {
         return Helper\response(false)->setMessage("Folder creation failed");
      }
   }
);



$fs->post('/deletefile', function(Request $request)
   {
      if(\JsonConfig::instance()->getSetting("delete")!==true) {
         return Helper\response(false)->setMessage("delete feature not enabled.");
      }

      $filepath = $request->get("filepath");
      $path = BASE.ltrim($filepath, DIRECTORY_SEPARATOR);
      $targetshare = \FsTools\getShareFromPath($path);

      // Check permissions
      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "delete", true)==false) {
         return Helper\response(false)->setMessage("Operation not allowed");
      }

      try {
         \Webshelf\Util\File::deleteRecusive($path);
         return Helper\response(true);
      } catch(\Exception $ex) {
         return Helper\response(false)->setMessage("Delete failed");
      }
   }
);



$fs->post('/fileoperation', function(Request $request)
   {
      $operation = $request->get("operation");
      $filepath = $request->get("filepath");
      $target = $request->get("target");

      if(!in_array($operation, array("copy", "move"))) {
         return Helper\response(false)->setMessage("Unknown operation");
      }

      $permission = $operation;
      if($permission=="move") {
         $permission = "move_rename";
      }

      $sourcepath = BASE.$filepath;
      $targetpath = BASE.$target;

      $sourceshare = \FsTools\getShareFromPath($sourcepath);
      $targetshare = \FsTools\getShareFromPath($targetpath);

      $rglobal = \JsonConfig::instance()->getSetting($permission);
      $rsharesorce = \JsonConfig::instance()->hasUserShareProperty($sourceshare, $permission, true);
      $rsharetarget = \JsonConfig::instance()->hasUserShareProperty($targetshare, $permission, true);

      if($rglobal==false || $rsharesorce==false || $rsharetarget==false) {
         if($rglobal==true) {
            return Helper\response(false)->setMessage(basename($sourcepath).": Operation not allowed in/between this shares");
         } else {
            return Helper\response(false)->setMessage(basename($sourcepath).": Operation disabled");
         }
      }

      if(!is_dir($sourcepath) && !is_file($sourcepath)) {
         return Helper\response(false)->setMessage(basename($sourcepath).": Source not exist");
         return;
      }

      if(!is_dir($targetpath)) {
         return Helper\response(false)->setMessage(basename($sourcepath).": Target not exist");
         return;
      }

      if(file_exists($targetpath.DIRECTORY_SEPARATOR.basename($sourcepath))) {
         return Helper\response(false)->setMessage(basename($sourcepath).": Target already exist");
         return;
      }

      $methodname = "r".$operation;
      $result = \Webshelf\Util\File::$methodname($sourcepath, $targetpath);
      if($result) {
         return Helper\response(true);
      } else {
         return Helper\response(false);
      }
   }
);



$fs->post('/renamefile', function(Request $request)
   {
      $file = $request->get("file");
      $newname = preg_replace("/[^A-Za-z0-9\-_\.]/", "_", $request->get("newname"));

      $sourcefile = realpath(BASE.$file);
      $targetfile = dirname($sourcefile).DIRECTORY_SEPARATOR.$newname;
      $share = \FsTools\getShareFromPath($sourcefile);

      $rglobal = \JsonConfig::instance()->getSetting("move_rename");
      $rsharesorce = \JsonConfig::instance()->hasUserShareProperty($share, "move_rename", true);

      if($rglobal!=true || $rsharesorce!=true) {
         return Helper\response(false)->setMessage("Rename not allowed");
      }

      if(!file_exists($sourcefile)) {
         return Helper\response(false)->setMessage("Sourcefile not exist");
      }

      if(file_exists($targetfile)) {
         return Helper\response(false)->setMessage("Targetfile already exist");
      }

      $result = rename($sourcefile, $targetfile);
      if($result) {
         return Helper\response(true);
      } else {
         return Helper\response(false)->setMessage("Rename from '".$sourcefile."' to '".$targetfile."' failed");
      }
   }
);


$fs->put('/upload', function(Request $request)
   {
      if(\JsonConfig::instance()->getSetting("upload")!==true) {
         return Helper\response(false)->setMessage("Upload not enabled");
      }

      // Try to disable time_limit
      if(function_exists("set_time_limit")) {
         set_time_limit(0);
      }

      // Request parameters
      $length = $request->headers->get("Content-Length");
      $xfilename = $request->headers->get("X-File-Name");

      $maxsize = \JsonConfig::instance()->getSetting("upload_maxsize")*1024*1024;
      $targetpath = $request->get("targetpath");

      if(!$request->isXmlHttpRequest()) {
         return Helper\response(false)->setMessage("Bad Request: XMLHttpRequest required");
      }

      if($length>$maxsize) {
         return Helper\response(false)->setMessage("Bad Request: Content length larger than ".($maxsize/1024/1024)." MB");
      }

      // Check share permissions
      $path = BASE.$targetpath;
      $targetshare = FsTools\getShareFromPath($path);

      if(\JsonConfig::instance()->hasUserShareProperty($targetshare, "upload", true)==false) {
         return Helper\response(false)->setMessage("Operation not allowed");
      }

      // Make filenames
      $targetfile = FsTools\getUniqName($path."/".$xfilename);

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

         if($progress_size>$maxsize) {
            return Helper\response(false)->setMessage("File (".($length/1024/1024)." MB) bigger than ".($maxsize/1024/1024)." MB");
         } else {
            return Helper\response(false)->setMessage(number_format($length>0 ? ($length/1024/1024) : 0, 2)." MB expected, ".
                  number_format($progress_size>0 ? ($progress_size/1024/1024) : 0, 2)." MB written. Unknown error.");
         }

      } else {
         return Helper\response(true);
      }
   }
);


$app->mount('/filesystem', $fs);
