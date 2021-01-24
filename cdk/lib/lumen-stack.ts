import * as cdk from '@aws-cdk/core';
import { Deployer } from './deployer';
import path = require("path");
import fs = require("fs");

const environment = require("dotenv").parse(
  fs.readFileSync(path.join(__dirname, "../../lumen/.env"))
);

export class LumenStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      new Deployer(this, "CDK-Lumen", {
        layers: [
          // "arn:aws:lambda:ap-southeast-1:679733785443:layer:bref-wkhtmltopdf:1",
          "bref:layer.php-74-fpm",
          "bref:extra.imagick-php-74",
          "act:extra.bref-wkhtmltopdf",
        ],
        src: "../../lumen",
        handler: "public/index.php",
        environment,
      });
  }
}
