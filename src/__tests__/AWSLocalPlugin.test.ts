import { AWSLocalPlugin } from '../index';
import { PluginConfig, OrcdkConfig } from '@orcdkestrator/core';
import { exec as execCallback } from 'child_process';

// Mock child_process
jest.mock('child_process');
const mockExec = execCallback as jest.MockedFunction<typeof execCallback>;

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
      options: {}
    };

    mockOrcdkConfig = {
      version: '1.0.0',
      environments: {},
      isLocal: true,
      plugins: []
    };

    plugin = new AWSLocalPlugin();
  });

  describe('initialization', () => {
    it('should have correct name', () => {
      expect(plugin.name).toBe('awslocal');
    });
  });

  describe('beforeStackDeploy', () => {
    it('should execute awslocal configure when enabled', async () => {
      mockExec.mockImplementation((cmd, callback) => {
        if (callback) callback(null, 'success', '');
      });

      await plugin.beforeStackDeploy(mockConfig, mockOrcdkConfig);

      expect(mockExec).toHaveBeenCalledWith(
        'awslocal configure set aws_access_key_id test',
        expect.any(Function)
      );
    });
  });
});
