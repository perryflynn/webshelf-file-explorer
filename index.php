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
