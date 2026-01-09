#!/bin/bash

# Build and deploy script
echo "Building SAM application..."
sam build

echo "Deploying to AWS..."
sam deploy --stack-name wall-write-open-graph-lambda --no-confirm-changeset --no-fail-on-empty-changeset --region us-east-1 --capabilities CAPABILITY_IAM

echo "Deployment complete!"
