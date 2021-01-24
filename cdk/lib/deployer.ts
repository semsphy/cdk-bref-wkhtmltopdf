import cdk = require('@aws-cdk/core');
import lambda = require('@aws-cdk/aws-lambda');
import { Duration, Stack } from '@aws-cdk/core';
import apigw = require('@aws-cdk/aws-apigateway');
import path = require('path');

export interface DeployerProps {
  layers: string[]; // 'arn:aws:lambda:us-west-2:209497400698:layer:php-72-fpm:10',
  src: string; // '../laravel58-cdk',
  handler: string; // 'public/index.php'
  environment: {
    [key: string]: string;
  };
}

export class Deployer extends cdk.Construct {
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
            exclude:[".env"]
          }),
          handler: props.handler,
          layers: props.layers.map(layer => {
            return lambda.LayerVersion.fromLayerVersionArn(
              this,
              layer,
              this.geBreftLayer(layer)
            );
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

    geBreftLayer(layer: string){

      const layers = require(`${this.src}/vendor/bref/bref/layers.json`);
      const extras = require('./layers.json');
      const extensions = require(`${this.src}/vendor/bref/extra-php-extensions/layers.json`);
      const region = this.region;
      const account = this.account;

      if (layer.startsWith('bref:layer.')) {
        const layerName = layer.substr("bref:layer.".length);
        if (!(layerName in layers)) {
          throw `Unknown Bref layer named "${layerName}"`;
        }
        if (!(region in layers[layerName])) {
          throw `There is no Bref layer named "${layerName}" in region "${region}"`;
        }

        const version = layers[layerName][region];

        return `arn:aws:lambda:${region}:209497400698:layer:${layerName}:${version}`;
      }
      else if(layer.startsWith('bref:extra.')){
          const layerName = layer.substr('bref:extra.'.length);

          if (!(layerName in extensions)) {
            throw `Unknown Bref extra layer named "${layerName}"`;
          }
          if (!(region in extensions[layerName])) {
            throw `There is no Bref extra layer named "${layerName}" in region "${region}"`;
          }
          const version = extensions[layerName][region];
          return `arn:aws:lambda:${region}:403367587399:layer:${layerName}:${version}`;
      }else if (layer.startsWith("act:extra.")) {
        const layerName = layer.substr("act:extra.".length);

        if (!(layerName in extras)) {
          throw `Unknown Bref extra layer named "${layerName}"`;
        }
        if (!(region in extras[layerName])) {
          throw `There is no Bref extra layer named "${layerName}" in region "${region}"`;
        }
        const version = extras[layerName][region];
        return `arn:aws:lambda:${region}:${account}:layer:${layerName}:${version}`;
      }

      return layer;

    }


}
