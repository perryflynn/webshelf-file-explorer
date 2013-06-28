<!DOCTYPE html>
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>webshelf file explorer @ <?php echo $_SERVER['HTTP_HOST']; ?></title>

      <link rel='StyleSheet' type='text/css' href='ext/resources/css/ext-all-gray.css'>
      <link rel='StyleSheet' type='text/css' href='style.css'>

      <script type="text/javascript" src="ext/ext-all<?php echo ($_SERVER['HTTP_HOST']=="raspberrypi" ? "-debug" : "") ?>.js"></script>
      <script type="text/javascript" src="config.js"></script>
      <script type="text/javascript" src="app/msg.js"></script>
      <script type="text/javascript" src="app/hashmanager.js"></script>

      <script type="text/javascript">
         var hostname = "<?php echo $_SERVER['HTTP_HOST']; ?>";
         var separator = "<?php echo addslashes(DIRECTORY_SEPARATOR); ?>";
         HashManager.init();
      </script>

      <script type="text/javascript" src="app/app.js"></script>

   </head>
   <body>

      <noscript>
         <div style="position:absolute; top:32px; left:32px; font-size:16px; color:red; font-weight: bold; font-family: Arial;">
            Please enable Java Script!
         </div>
      </noscript>

      <img src="ajax.gif" style="display:block; margin:200px auto 0px auto;" alt="Loading..." title="Loading...">

   </body>
</html>
