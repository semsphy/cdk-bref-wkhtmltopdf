<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Concerns\HasTelegram;

class SendToTelegram extends Job
{
    use HasTelegram;

    private $message;
    private $chat_id;

    public function __construct($chat_id, $message)
    {
        $this->chat_id = $chat_id;
        $this->message = $message;
    }

    public function handle(): void
    {
        $this->notify('Greeing');

        \info('SQS: Work fine', [
            'chat_id' => $this->chat_id,
            'message' => $this->message
        ]);

    }

    protected function messages(){
        return [
            'User Id' => $this->chat_id,
            'Message' => $this->message
        ];
    }
}
