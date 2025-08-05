# AWS Local Plugin API Reference

## Plugin Configuration

```typescript
interface AwsLocalConfig {
  enabled: boolean;
  endpoint?: string;
  region?: string;
}
```

## Lifecycle Hooks

### `beforeStackDeploy`
Intercepts AWS CLI commands and redirects them to LocalStack using awslocal.

### `afterStackDeploy`
Cleans up any temporary configurations.

## Methods

### `initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void>`
Initializes the plugin and verifies awslocal is installed.

### `isAwsLocalInstalled(): boolean`
Checks if awslocal CLI is available in the system PATH.

### `interceptAwsCommand(command: string): string`
Transforms AWS CLI commands to use awslocal instead.
