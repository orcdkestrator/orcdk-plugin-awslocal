# AWS Local Plugin Examples

## Basic Configuration

```json
{
  "environments": {
    "local": {
      "isLocal": true,
      "plugins": {
        "@orcdkestrator/awslocal": {
          "enabled": true
        }
      }
    }
  }
}
```

## Advanced Configuration with Custom Endpoint

```json
{
  "environments": {
    "local": {
      "isLocal": true,
      "plugins": {
        "@orcdkestrator/awslocal": {
          "enabled": true,
          "config": {
            "endpoint": "http://localhost:4566",
            "region": "us-east-1"
          }
        }
      }
    }
  }
}
```

## Usage Example

```bash
# Deploy to LocalStack (AWS commands are automatically intercepted)
orcdk deploy --env local

# The plugin will transform commands like:
# aws s3 ls -> awslocal s3 ls
# aws cloudformation deploy -> awslocal cloudformation deploy
```
