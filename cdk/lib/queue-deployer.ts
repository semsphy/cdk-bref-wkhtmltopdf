import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import sqs = require('@aws-cdk/aws-sqs');
import { Duration, Stack } from '@aws-cdk/core';
import apigw = require('@aws-cdk/aws-apigateway');
import path = require('path');
import { getBrefLayers } from './utils';
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

export interface QueueProps {
  layers: string[]; // 'arn:aws:lambda:us-west-2:209497400698:layer:php-72-fpm:10',
  src: string; // '../laravel58-cdk',
  handler: string; // 'public/index.php'
  environment: {
    [key: string]: string;
  };
}

export class QueueDeployer extends cdk.Construct {
    readonly src: string;
    readonly account: string;
    readonly region: string;
    readonly name: string;

    constructor(scope: cdk.Construct, id: string, props: QueueProps) {
        super(scope, id);

        this.src = path.join(__dirname, props.src);
        this.account = props.environment.CDK_ACCOUNT;
        this.region = props.environment.CDK_REGION;

        const deadLetterQueue = new sqs.Queue(this, "SqsLumendeadLetterQueue", {
          queueName: "SqsLumendeadLetterQueue",
          deliveryDelay: cdk.Duration.millis(0),
          retentionPeriod: cdk.Duration.days(14),
        });

        const queue = new sqs.Queue(this, "SqsLumenQeueue", {
          queueName: props.environment.SQS_QUEUE,
          deliveryDelay: cdk.Duration.millis(0),
          visibilityTimeout: cdk.Duration.seconds(30),
          deadLetterQueue: {
            maxReceiveCount: 1,
            queue: deadLetterQueue,
          },
        });

        new lambda.Function(this, "bref-queue-function", {
          runtime: lambda.Runtime.PROVIDED_AL2, // for custom runtime
          code: lambda.Code.fromAsset(this.src, {
            exclude: [".env"],
          }),
          handler: props.handler,
          layers: getBrefLayers(this, props.src, props.layers, {
            account: this.account,
            region: this.region,
          }),
          timeout: Duration.seconds(30), // set timeout to 30 seconds
          memorySize: 1024, // set memory to 1024 MB
          environment: props.environment,
          events: [new SqsEventSource(queue, {
            batchSize: 1
          })],
        });
    }
}
