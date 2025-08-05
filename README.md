# Orcdkestrator Plugin: AWS Local

Automatically intercepts AWS CLI commands and redirects them to LocalStack when running in local development mode. This plugin enables seamless local development by ensuring all AWS commands target your LocalStack instance instead of real AWS services.

## Installation

```bash
npm install @orcdkestrator/orcdk-plugin-awslocal --save-dev
```

## Configuration

Add to your `orcdk.config.json`:

```json
{
  "plugins": [
    {
      "name": "awslocal",
      "enabled": true
    }
  ]
}
```

## Usage

Once configured, the plugin automatically activates when:
1. Your environment is set to local mode (`isLocal: true`)
2. The `awslocal` CLI is installed on your system

When active, all AWS CLI commands executed during CDK deployment will be redirected to LocalStack.

## API Reference

See [API Documentation](docs/api.md) for detailed information.

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| enabled | boolean | true | Enable/disable the plugin |

## Prerequisites

This plugin requires `awslocal` CLI to be installed:

```bash
pip install awscli-local
```

## How It Works

The plugin intercepts AWS CLI command executions and replaces them with `awslocal` equivalents when running in local mode. This ensures that:
- S3 operations target LocalStack's S3 service
- CloudFormation commands work with LocalStack
- All other AWS service calls are properly redirected

## Examples

See the [examples directory](docs/examples/) for complete examples.

## Development

```bash
# Clone the repository
git clone https://github.com/orcdkestrator/orcdk-plugin-awslocal.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT - see [LICENSE](LICENSE) for details.
<\!-- CI test -->
// Build triggered after core package publish
