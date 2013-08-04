<?php

include('init.php');

// Initialize silex
require_once ROOT.'vendor/autoload.php';
$app = new Silex\Application();

$app['debug'] = true;

// Load template engine
$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => ROOT.'views',
));

// Load routing files
$routes = glob(ROOT."routes/route.*.php");
foreach($routes as $route) {
   include($route);
}

// Run application
$app->run();
