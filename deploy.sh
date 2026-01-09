#!/bin/bash

# Build and deploy script
echo "Building SAM application..."
sam build

echo "Deploying to AWS..."
sam deploy --region us-east-1

echo "Deployment complete!"
