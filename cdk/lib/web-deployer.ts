import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import { Duration, Stack } from '@aws-cdk/core';
import apigw = require('@aws-cdk/aws-apigateway');
import path = require('path');
import { getBrefLayers } from './utils';

export interface DeployerProps {
  layers: string[]; // 'arn:aws:lambda:us-west-2:209497400698:layer:php-72-fpm:10',
  src: string; // '../laravel58-cdk',
  handler: string; // 'public/index.php'
  environment: {
    [key: string]: string;
  };
}

export class WebDeployer extends cdk.Construct {
    readonly src: string;
    readonly account: string;
    readonly region: string;

    constructor(scope: cdk.Construct, id: string, props: DeployerProps) {
        super(scope, id);

        this.src = path.join(__dirname, props.src);
        this.account = props.environment.CDK_ACCOUNT;
        this.region = props.environment.CDK_REGION;

        const fn = new lambda.Function(this, "cdk-lumen-wkhtmltopdf", {
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
        });

        // ApiGatewayRestApi
        const api = new apigw.RestApi(this, "CDK-Bref-api", {
          endpointTypes: [apigw.EndpointType.EDGE],
          // enable logging
          // deployOptions: {
          // loggingLevel: apigw.MethodLoggingLevel.INFO,
          // }
          binaryMediaTypes: ["*/*"],
        });

        // Integration with Lambda function
        const postAPIIntegration = new apigw.LambdaIntegration(fn, {
            proxy: true,
        });

        // ApiGatewayMethodAny
        api.root.addMethod('ANY', postAPIIntegration);

        // ApiGatewayResourceProxyVar
        const resource = api.root.addResource("{proxy+}");
        resource.addMethod('ANY', postAPIIntegration);
    }
}
