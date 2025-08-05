import { AWSLocalPlugin } from '../index';
import { PluginConfig, OrcdkConfig } from '@orcdkestrator/core';

// Mock EventBus
jest.mock('@orcdkestrator/core', () => ({
  ...jest.requireActual('@orcdkestrator/core'),
  EventBus: {
    getInstance: jest.fn(() => ({
      emit: jest.fn(),
      on: jest.fn()
    }))
  }
}));

describe('AWSLocalPlugin', () => {
  let plugin: AWSLocalPlugin;
  let mockConfig: PluginConfig;
  let mockOrcdkConfig: OrcdkConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfig = {
      name: 'awslocal',
      enabled: true,
      config: {}
    };

    mockOrcdkConfig = {
      cdkRoot: 'cdk',
      deploymentStrategy: 'auto',
      environments: {
        local: { displayName: 'Local', isLocal: true }
      },
      plugins: []
    };

    plugin = new AWSLocalPlugin();
  });

  describe('initialization', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('awslocal');
    });
  });

  describe('initialize', () => {
    it('should initialize the plugin successfully', async () => {
      await plugin.initialize(mockConfig, mockOrcdkConfig);
      
      expect(plugin.name).toBe('@orcdkestrator/awslocal');
      expect(plugin.version).toBeDefined();
    });
  });
});
