<?php

use Symfony\Component\HttpFoundation\Request;

$app->get('/thumbnail/{file}', function($file) use($app)
   {
      $image = null;
      $mimetype = "image/png";
      $thumb_notfound = base64_decode("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");
      $thumb_error = base64_decode("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");

      //$dir = dirname(BASE.$file)."/";
      $thumbdir = ROOT."thumbnails".DIRECTORY_SEPARATOR;
      if(!is_dir($thumbdir)) {
         mkdir($thumbdir, 0755);
      }

      try
      {
         if(FsTools\is_allowed("files", BASE.$file, true))
         {
            $checksum = sha1_file(BASE.$file);
            if(!is_file($thumbdir.$checksum))
            {
               $r = new \Webshelf\Util\NewImageResize(200, 200);
               $r->load(BASE.$file)->resize()->chop()->save($thumbdir.$checksum);
            }

            if(is_file($thumbdir.$checksum)) {
               $image = file_get_contents($thumbdir.$checksum);
               $mimetype = "image/".end(explode(".", $file));
            } else {
               $image = $thumb_error;
            }

         }
      }
      catch(Webshelf\FileNotFoundException $ex)
      {
         $image = $thumb_notfound;
      }
      catch(Webshelf\AccessDeniedException $ex)
      {
         $image = $thumb_error;
      }

      header("Content-Type: ".$mimetype, true);
      header("Content-Length: ".strlen($image), true);
      echo $image;
      exit;

   }
)
->assert("file", ".*");
