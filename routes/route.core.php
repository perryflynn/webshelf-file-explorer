<?php

$app->get('/', function () use ($app) {

   // Build javascript settings object
   $settings = \JsonConfig::instance()->getSettings();
   $uitheme = "-".$settings['uitheme'];
   if($uitheme=="-classic") $uitheme = "";

   $varlist = array();
   foreach($settings as $key => $value) {
      if(is_bool($value)) {
         $varlist[] = "            '".$key."': ".($value ? "true" : "false");
      } elseif(is_int($value)) {
         $varlist[] = "            '".$key."': ".$value;
      } else {
         $varlist[] = "            '".$key."': \"".str_replace('"', "\\\"", $value)."\"";
      }
   }
   $jssettings = "var Settings = {\n".implode(",\n", $varlist)."\n         };\n";

   // ExtJS core file
   $extjscore = "ext/ext-all".($_SERVER['HTTP_HOST']=="192.168.56.101" ? "-debug" : "").".js";


   $host = $app['request']->getHost();

   return $app['twig']->render('index.twig', array(
       "jssettings" => $jssettings,
       "uitheme" => $uitheme,
       "extjscore" => $extjscore
   ));
});
