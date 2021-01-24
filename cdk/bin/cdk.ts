#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { LumenStack } from '../lib/lumen-stack';

const app = new cdk.App();
new LumenStack(app, "CdkStack");
