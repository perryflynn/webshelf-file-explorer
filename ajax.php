<?php

define('BASE', dirname(__FILE__)."/files/");

function response($success, $message, $result=null) {
   echo json_encode(array(
       "success" => $success,
       "message" => $message,
       "result" => $result
   ));
   exit(0);
}

function is_allowed($filter, $path) {
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


if(isset($_GET['node']) && !empty($_GET['node']) && $_GET['node']!="root") {
   $_GET['path'] = $_GET['node'];
}

if(isset($_GET['path']) && !empty($_GET['path'])) {
   $path = $_GET['path'];
   $path = BASE."/".$path;
   $path = realpath($path);
   $file = null;
   
   $filter = (isset($_GET['filter']) && ($_GET['filter']=="files" || $_GET['filter']=="folders") ? $_GET['filter'] : "all");
   
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
            if($file!="." && $file!=".." && is_allowed($filter, $path."/".$file)) {
               
               $childs = scandir(BASE.$filebase.$file);
               $folders = 0;
               $files = 0;
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
               
               $absfile = BASE.$filebase.$file;
               $result[] = array(
                   "id" => $filebase.$file,
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
                       "url" => "files/".$filebase.$file
                   ),
                   "qtip" => $folders." Folders, ".$files." Files"
               );
               
            }
         }
      }
      
      response(true, null, $result);
      
   }
}

response(false, "Bad Request");
