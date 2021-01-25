<?php declare(strict_types=1);

use Bref\LaravelBridge\Queue\LaravelSqsHandler;

require __DIR__ . '/vendor/autoload.php';

/**
 * @var Laravel\Lumen\Application $app
 * */
$app = require __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

return $app->makeWith(LaravelSqsHandler::class, [
    'connection' => 'sqs',
    'queue' => getenv('SQS_QUEUE'),
]);
