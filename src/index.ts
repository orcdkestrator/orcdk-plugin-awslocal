/* eslint-disable no-console */
/* eslint-disable no-console */
import { Plugin, PluginConfig, OrcdkConfig, EventBus, EventTypes } from '@orcdkestrator/core';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCallback);

/**
 * AWSLocal plugin for AWS command interception
 * Automatically uses awslocal for local development when available
 * 
 * @example
 * ```json
 * {
 *   "name": "awslocal",
 *   "enabled": true
 * }
 * ```
 */
export class AWSLocalPlugin implements Plugin {
  public readonly name = '@orcdkestrator/awslocal';
  public readonly version = '1.0.0';
  
  private enabled = false;
  private hasAWSLocal = false;
  private eventBus: EventBus | null = null;
  
  async initialize(config: PluginConfig, orcdkConfig: OrcdkConfig): Promise<void> {
    const env = process.env.CDK_ENVIRONMENT;
    const envConfig = orcdkConfig.environments[env || ''];
    this.enabled = !!(envConfig?.isLocal && config.enabled);
    
    // Subscribe to events
    this.eventBus = EventBus.getInstance();
    this.subscribeToEvents();
  }
  
  /**
   * Subscribe to relevant events
   */
  private subscribeToEvents(): void {
    if (!this.eventBus) return;
    
    // Listen for pattern detection event
    this.eventBus.on(EventTypes['orchestrator:before:pattern-detection'], async () => {
      if (!this.enabled) return;
      await this.checkAWSLocal();
      this.logStatus();
    });
  }
  
  private async checkAWSLocal(): Promise<void> {
    try {
      await exec('which awslocal');
      this.hasAWSLocal = true;
    } catch {
      this.hasAWSLocal = false;
    }
  }
  
  private logStatus(): void {
    if (this.hasAWSLocal) {
      console.log('[awslocal] AWS commands will use awslocal');
    } else {
      console.warn(
        '[awslocal] awscli-local not found. AWS commands will use standard aws CLI.\n' +
        '  To enable LocalStack integration, install awscli-local: pip install awscli-local\n' +
        '  For more information, visit: https://github.com/localstack/awscli-local'
      );
    }
  }
  
  getAWSCommand(): string {
    return this.hasAWSLocal ? 'awslocal' : 'aws';
  }
  
  async cleanup(): Promise<void> {
    // Unsubscribe from events
    if (this.eventBus) {
      this.eventBus.removeAllListeners(EventTypes['orchestrator:before:pattern-detection']);
    }
    
    // Reset state for consistency
    this.hasAWSLocal = false;
  }
}

// Export as default for easy importing
export default AWSLocalPlugin;