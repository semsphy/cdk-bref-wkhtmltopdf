<?php

/** @var \Laravel\Lumen\Routing\Router $router */

use App\Jobs\ProcessPodcast;
use App\Jobs\SendToTelegram;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\App;
use Telegram\Bot\Laravel\Facades\Telegram;

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It is a breeze. Simply tell Lumen the URIs it should respond to
| and give it the Closure to call when that URI is requested.
|
*/

$router->get('/', function () use ($router) {
    $snappy = App::make('snappy.pdf');
    //To file
    $html = '<h1>Bill</h1><p>You owe me money, dude.</p>';
    $snappy->generateFromHtml($html, '/tmp/bill-123.pdf');
    $snappy->generate('http://www.github.com', '/tmp/github.pdf');
    //Or output:
    return new Response(
        $snappy->getOutputFromHtml($html),
        200,
        array(
            'Content-Type'          => 'application/pdf',
            'Content-Disposition'   => 'attachment; filename="file.pdf"'
        )
    );
});

$router->get('/modules', function () use ($router) {
    return response(get_loaded_extensions());
});

$router->get('/telegram/info', function () use ($router) {
    $response = Telegram::getMe();

    $botId = $response->getId();
    $firstName = $response->getFirstName();
    $username = $response->getUsername();

    return response(compact('botId', 'firstName', 'username'));
});

$router->get('/queue', function () use ($router) {

    dispatch(new SendToTelegram('251017456', 'HELLO ME'));

    return response('dispatched');
});
