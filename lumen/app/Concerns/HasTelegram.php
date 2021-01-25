<?php

namespace App\Concerns;

use Telegram\Bot\Laravel\Facades\Telegram;


trait HasTelegram {

    public function notify($title, $emoji = "👉"){
        if(count($this->messages())){
            $response = Telegram::sendMessage([
                "chat_id" => $this->chat_id,
                "text" => $this->format($emoji, $title, $this->messages()),
                "parse_mode" => 'markdown',
                'disable_notification' => false,
            ]);
        }
    }

    protected function format($emoji, $startTitle, $messages){

        $message = "";

        $last_key = key(array_reverse($messages));

        foreach ($messages as $title => $info)
        {
            $sign     = $last_key == $title?"└":"├";
            $message = $message."\n{$sign} *". ucfirst($title) . "* : {$info}";
        }

        return "{$emoji} {$startTitle} :{$message}";

    }
}
