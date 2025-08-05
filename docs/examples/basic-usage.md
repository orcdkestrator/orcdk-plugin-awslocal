# Basic Usage Example

This example demonstrates how to use the AWS Local plugin with Orcdkestrator.

## Project Structure

```
my-cdk-project/
├── orcdk.config.json
├── package.json
├── cdk/
│   └── bin/
│       └── app.ts
└── src/
    └── stacks/
        └── MyStack.ts
```

## Configuration

### orcdk.config.json

```json
{
  "environments": {
    "local": {
      "account": "000000000000",
      "region": "us-east-1",
      "isLocal": true
    },
    "dev": {
      "account": "123456789012",
      "region": "us-east-1"
    }
  },
  "plugins": [
    {
      "name": "localstack",
      "enabled": true,
      "config": {
        "autoStart": true
      }
    },
    {
      "name": "awslocal",
      "enabled": true
    }
  ]
}
```

## Usage

1. Install the plugin:
   ```bash
   npm install @orcdkestrator/orcdk-plugin-awslocal --save-dev
   ```

2. Install awscli-local:
   ```bash
   pip install awscli-local
   ```

3. Deploy to LocalStack:
   ```bash
   CDK_ENVIRONMENT=local orcdk deploy
   ```

When the deployment runs, all AWS CLI commands will automatically be redirected to LocalStack. For example:
- `aws s3 cp` becomes `awslocal s3 cp`
- `aws cloudformation describe-stacks` becomes `awslocal cloudformation describe-stacks`

## Verification

You can verify the plugin is working by checking the deployment logs:

```
[awslocal] AWS CLI command intercepted and redirected to LocalStack
[awslocal] Executing: awslocal s3 cp ...
```

## Common Use Cases

### S3 Bucket Operations
When your CDK app creates S3 buckets and uploads files, the AWS Local plugin ensures all operations target LocalStack:

```typescript
// This will use LocalStack's S3 when deployed locally
new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  sources: [s3deploy.Source.asset('./website')],
  destinationBucket: websiteBucket,
});
```

### CloudFormation Queries
CDK's internal CloudFormation queries are automatically redirected:

```typescript
// This will query LocalStack's CloudFormation when deployed locally
const existingVpc = ec2.Vpc.fromLookup(this, 'VPC', {
  vpcId: 'vpc-12345'
});
```