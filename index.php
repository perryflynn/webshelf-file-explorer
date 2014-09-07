<?php

include('init.php');

// Initialize silex
$app = new Silex\Application();

// Debugging settings
$debug_remotehosts = array(
    "/^192\.168\.42\./"
);

foreach($debug_remotehosts as $host)
{
   if(preg_match($host, $_SERVER['REMOTE_ADDR'])===1)
   {
      $app['debug'] = true;
      break;
   }
}


// Populate global settings
$settings = \JsonConfig::instance()->getSettings();
$uitheme = "-".$settings['uitheme'];
if($uitheme=="-classic")
{
   $uitheme = "";
}

$search = array("\"", "\n", "\r");
$replace = array("\\\"", "\\n", "\\r");
$varlist = array();
foreach($settings as $key => $value) {
   if(is_bool($value)) {
      $varlist[] = "            '".$key."': ".($value ? "true" : "false");
   } elseif(is_int($value)) {
      $varlist[] = "            '".$key."': ".$value;
   } else {
      $varlist[] = "            '".$key."': \"".str_replace($search, $replace, $value)."\"";
   }
}
$jssettings = "var Settings = {\n".implode(",\n", $varlist)."\n         };\n";

$app['webshelf'] = array(
    "extjslib" => "ext/ext-all".($app['debug']===true ? "-debug" : "").".js",
    "dirseparator" => addslashes(DIRECTORY_SEPARATOR),
    "uitheme" => $uitheme,
    "jssettings" => $jssettings,
    "release_version" => WEBSHELF_VERSION,
    "release_date" => WEBSHELF_DATE,
);

unset($settings, $uitheme, $search, $replace, $varlist, $jssettings);


// Load template engine
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => ROOT.'views',
));


// Template functions
$app['twig']->addFunction('baseFolder', new Twig_Function_Function('\FsTools\getBaseFolder'));
$app['twig']->addFunction('getSetting', new Twig_Function_Function('\JsonConfig::instance()->getSetting'));


// Load routing files
$routes = glob(ROOT."routes/route.*.php");
foreach($routes as $route) {
   include($route);
}


// Run application
$app->run();
