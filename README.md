# Wall Write Open Graph Lambda

CloudFront Edge Lambda function for generating Open Graph meta tags for wall write documents.

## Overview

This Lambda@Edge function intercepts requests to wall write documents and generates appropriate Open Graph meta tags for social media sharing and SEO.

## Architecture

- **Runtime**: Node.js 18.x
- **Type**: CloudFront Edge Lambda (Origin Response)
- **Region**: us-east-1 (required for Edge Lambda)
- **Memory**: 128MB
- **Timeout**: 3 seconds

## Features

- Detects bot/crawler requests using User-Agent and custom headers
- Fetches document metadata from Jober API
- Generates Open Graph and Twitter Card meta tags
- Supports multiple environments (dev, prod)

## Deployment

### Prerequisites

- AWS CLI configured
- Node.js 18.x

### Deploy with AWS CLI (Recommended)

```bash
# Build and deploy
./deploy.sh

# Or manually
cd src && zip -r ../function.zip . && cd ..
aws lambda update-function-code \
  --function-name set-open-graph-to-wall-write-document-on-origin-response \
  --zip-file fileb://function.zip \
  --region us-east-1
rm function.zip
```

### Deploy with SAM (Alternative)

```bash
# First time setup
sam deploy --guided

# Subsequent deployments
sam build
sam deploy
```

## Configuration

The function automatically detects the environment based on the CloudFront host header:

- `jober-dev-api-client2.s3.ap-northeast-2.amazonaws.com` → `https://dev-api2.jober.io`
- `jober-dev-api-client.s3.ap-northeast-2.amazonaws.com` → `https://dev-api.jober.io`
- `jober-api-client.s3.ap-northeast-2.amazonaws.com` → `https://api.jober.io` (default)

## Development

### Code Structure

```
src/
├── index.js          # Main Lambda function
template.yaml         # SAM template (optional)
deploy.sh            # Deployment script
package.json         # Node.js dependencies
```

## API Endpoints Used

- `GET /space-wall/document-option/{documentOptionId}` - Get document metadata
- `GET /space-wall/thumbnail/{wallUrl}` - Get wall thumbnail data

## Environment Variables

None required - configuration is handled through host header detection.

## IAM Permissions

Uses existing role: `arn:aws:iam::476364780248:role/service-role/cloudfront-edge-role`

Required permissions:
- CloudWatch Logs access
- Lambda execution permissions

## Monitoring

- CloudWatch Logs: `/aws/lambda/us-east-1.set-open-graph-to-wall-write-document-on-origin-response`
- CloudWatch Metrics: Lambda function metrics
- X-Ray Tracing: PassThrough mode

## Troubleshooting

### Common Issues

1. **Function not triggering**: Check CloudFront distribution configuration
2. **API timeouts**: Verify API endpoints are accessible
3. **Memory/timeout errors**: Monitor CloudWatch metrics

### Logs

```bash
# View recent logs
aws logs tail /aws/lambda/us-east-1.set-open-graph-to-wall-write-document-on-origin-response --follow
```

## Contributing

1. Make changes to `src/index.js`
2. Test locally if possible
3. Deploy using `./deploy.sh`
4. Monitor CloudWatch logs for issues
5. Commit changes to Git

## License

Internal Jober project - All rights reserved.
