import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");

export function getBrefLayers(
  stack: cdk.Construct,
  src: string,
  funcLayers: string[],
  env: any
): lambda.ILayerVersion[] {

  const layers = require(`${src}/vendor/bref/bref/layers.json`);
  const extras = require("./layers.json");
  const extensions = require(`${src}/vendor/bref/extra-php-extensions/layers.json`);
  const region = env.region;
  const account = env.account;

  return funcLayers.map(layer => {
    let brefLayer = layer;

    if (layer.startsWith("bref:layer.")) {
      const layerName = layer.substr("bref:layer.".length);
      if (!(layerName in layers)) {
        throw `Unknown Bref layer named "${layerName}"`;
      }
      if (!(region in layers[layerName])) {
        throw `There is no Bref layer named "${layerName}" in region "${region}"`;
      }

      const version = layers[layerName][region];

      brefLayer  = `arn:aws:lambda:${region}:209497400698:layer:${layerName}:${version}`;
    } else if (layer.startsWith("bref:extra.")) {
      const layerName = layer.substr("bref:extra.".length);

      if (!(layerName in extensions)) {
        throw `Unknown Bref extra layer named "${layerName}"`;
      }
      if (!(region in extensions[layerName])) {
        throw `There is no Bref extra layer named "${layerName}" in region "${region}"`;
      }
      const version = extensions[layerName][region];
      brefLayer = `arn:aws:lambda:${region}:403367587399:layer:${layerName}:${version}`;
    } else if (layer.startsWith("act:extra.")) {
      const layerName = layer.substr("act:extra.".length);

      if (!(layerName in extras)) {
        throw `Unknown Bref extra layer named "${layerName}"`;
      }
      if (!(region in extras[layerName])) {
        throw `There is no Bref extra layer named "${layerName}" in region "${region}"`;
      }
      const version = extras[layerName][region];
       brefLayer = `arn:aws:lambda:${region}:${account}:layer:${layerName}:${version}`;
    }

    return lambda.LayerVersion.fromLayerVersionArn(stack, layer, brefLayer);
  });
}
