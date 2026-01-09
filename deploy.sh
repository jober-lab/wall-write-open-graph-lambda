#!/bin/bash

# Build and deploy script using AWS CLI (safer for existing functions)
echo "Packaging Lambda function..."
cd src && zip -r ../function.zip . && cd ..

echo "Deploying to AWS Lambda..."
aws lambda update-function-code \
  --function-name set-open-graph-to-wall-write-document-on-origin-response \
  --zip-file fileb://function.zip \
  --region us-east-1

echo "Cleaning up..."
rm function.zip

echo "Deployment complete!"
