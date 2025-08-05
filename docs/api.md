# API Documentation

## Plugin Class

### `AWSLocalPlugin`

The main plugin class that implements the Orcdkestrator plugin interface.

```typescript
export class AWSLocalPlugin implements Plugin {
  public readonly name = '@orcdkestrator/awslocal';
  public readonly version: string;
  
  async initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void>;
  async beforeCommand?(commandInfo: CommandInfo): Promise<CommandInfo | void>;
}
```

### Methods

#### `initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void>`

Initializes the plugin with the provided configuration.

**Parameters:**
- `config`: Plugin-specific configuration
- `orcdkConfig`: Global Orcdkestrator configuration

**Returns:** Promise that resolves when initialization is complete

#### `beforeCommand(commandInfo: CommandInfo): Promise<CommandInfo | void>`

Intercepts AWS CLI commands and replaces them with awslocal equivalents.

**Parameters:**
- `commandInfo`: Object containing command details
  - `command`: The command being executed (e.g., 'aws')
  - `args`: Array of command arguments
  - `cwd`: Current working directory
  - `env`: Environment variables

**Returns:** Modified CommandInfo or void if no modification needed

### Configuration

The plugin accepts the following configuration options:

```typescript
interface AWSLocalPluginConfig {
  enabled: boolean;  // Enable/disable the plugin
}
```

### Events

The plugin emits the following events:

- `awslocal:command:intercepted` - When an AWS command is intercepted
- `awslocal:command:replaced` - When a command is replaced with awslocal
- `awslocal:check:failed` - When awslocal CLI is not found

### Example Usage

```typescript
import { AWSLocalPlugin } from '@orcdkestrator/orcdk-plugin-awslocal';
import { PluginManager } from '@orcdkestrator/core';

const pluginManager = new PluginManager();
const awsLocalPlugin = new AWSLocalPlugin();

await pluginManager.register(awsLocalPlugin);
```