<?php

use Symfony\Component\HttpFoundation\Request;

$app->get('/get/{file}', function($file) use($app)
   {
      try
      {
         if(FsTools\is_allowed("files", BASE.$file, true))
         {
            $download = false;
            $ext = strtolower(end(explode(".", $file)));
            $mime = null;
            switch($ext) 
            {
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
               case "css":
                  $mime = "text/css"; break;
               case "js":
                  $mime = "text/javascript"; break;
               case "txt":
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
      catch(Webshelf\FileNotFoundException $ex)
      {
         return $app['twig']->render('message.twig', array(
             "title" => "404 Not Found",
             "message" => "Requested file does not exist!",
             "button" => "error"
         ));
      }
      catch(Webshelf\AccessDeniedException $ex)
      {
         return $app['twig']->render('loginproxy.html.twig');
      }

      return Helper\response(false)->setMessage("File not found or permission denied.");

   }
)
->assert("file", ".*");
