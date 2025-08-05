import { AWSLocalPlugin } from '../index';
import { PluginConfig, OrcdkConfig } from '@orcdkestrator/core';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';

// Mock child_process
jest.mock('child_process');
const mockExec = execCallback as jest.MockedFunction<typeof execCallback>;

// Mock EventBus
jest.mock('@orcdkestrator/core', () => {
  const actual = jest.requireActual('@orcdkestrator/core');
  const mockEventBus = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    emitEvent: jest.fn(),
    removeAllListeners: jest.fn(),
    listeners: jest.fn().mockReturnValue([]),
    once: jest.fn()
  };
  return {
    ...actual,
    EventBus: {
      getInstance: jest.fn(() => mockEventBus)
    },
    EventTypes: {
      'orchestrator:before:pattern-detection': 'orchestrator:before:pattern-detection'
    }
  };
});

describe('AWSLocalPlugin', () => {
  let plugin: AWSLocalPlugin;
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;
  let mockEventBus: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset environment
    delete process.env.CDK_ENVIRONMENT;
    
    plugin = new AWSLocalPlugin();
    
    // Get mocked EventBus
    const mockedCore = jest.requireMock('@orcdkestrator/core');
    mockEventBus = mockedCore.EventBus.getInstance();
  });
  
  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleWarn.mockRestore();
  });
  
  describe('initialize', () => {
    it('enables plugin for local environment', async () => {
      process.env.CDK_ENVIRONMENT = 'local';
      const config: PluginConfig = { name: 'awslocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          local: { displayName: 'Local', isLocal: true }
        },
        plugins: [],
      };
      
      await plugin.initialize(config, orcdkConfig);
      
      expect((plugin as any).enabled).toBe(true);
    });
    
    it('disables plugin when config disabled', async () => {
      process.env.CDK_ENVIRONMENT = 'local';
      const config: PluginConfig = { name: 'awslocal', enabled: false };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          local: { displayName: 'Local', isLocal: true }
        },
        plugins: [],
      };
      
      await plugin.initialize(config, orcdkConfig);
      
      expect((plugin as any).enabled).toBe(false);
    });
    
    it('disables plugin for non-local environment', async () => {
      process.env.CDK_ENVIRONMENT = 'production';
      const config: PluginConfig = { name: 'awslocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          production: { displayName: 'Production', isLocal: false }
        },
        plugins: [],
      };
      
      await plugin.initialize(config, orcdkConfig);
      
      expect((plugin as any).enabled).toBe(false);
    });
  });
  
  describe('checkAWSLocal', () => {
    it('sets hasAWSLocal to true when awslocal found', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(null, '/usr/local/bin/awslocal', '');
        return {} as any;
      });
      
      await (plugin as any).checkAWSLocal();
      
      expect((plugin as any).hasAWSLocal).toBe(true);
    });
    
    it('sets hasAWSLocal to false when awslocal not found', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(new Error('command not found'), '', 'command not found');
        return {} as any;
      });
      
      await (plugin as any).checkAWSLocal();
      
      expect((plugin as any).hasAWSLocal).toBe(false);
    });
  });
  
  describe('logStatus', () => {
    it('logs success message when awslocal available', () => {
      (plugin as any).hasAWSLocal = true;
      
      (plugin as any).logStatus();
      
      expect(mockConsoleLog).toHaveBeenCalledWith('[awslocal] AWS commands will use awslocal');
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
    
    it('logs warning when awslocal not available', () => {
      (plugin as any).hasAWSLocal = false;
      
      (plugin as any).logStatus();
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[awslocal] awscli-local not found. AWS commands will use standard aws CLI.\n' +
        '  To enable LocalStack integration, install awscli-local: pip install awscli-local\n' +
        '  For more information, visit: https://github.com/localstack/awscli-local'
      );
      expect(mockConsoleLog).not.toHaveBeenCalled();
    });
  });
  
  describe('getAWSCommand', () => {
    it('returns awslocal when available', () => {
      (plugin as any).hasAWSLocal = true;
      
      expect(plugin.getAWSCommand()).toBe('awslocal');
    });
    
    it('returns aws when awslocal not available', () => {
      (plugin as any).hasAWSLocal = false;
      
      expect(plugin.getAWSCommand()).toBe('aws');
    });
  });
  
  describe('pattern detection event handling', () => {
    beforeEach(async () => {
      (plugin as any).enabled = true;
      // Initialize the plugin to register event handlers
      const config: PluginConfig = { name: 'awslocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          local: { displayName: 'Local', isLocal: true }
        },
        plugins: [],
      };
      process.env.CDK_ENVIRONMENT = 'local';
      await plugin.initialize(config, orcdkConfig);
    });
    
    it('checks for awslocal and logs status when enabled', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(null, '/usr/local/bin/awslocal', '');
        return {} as any;
      });
      
      // Get the event handler from the mock
      const mockedCore = jest.requireMock('@orcdkestrator/core');
      const eventHandler = mockEventBus.on.mock.calls.find(
        (call: any[]) => call[0] === mockedCore.EventTypes['orchestrator:before:pattern-detection']
      )?.[1];
      
      await eventHandler();
      
      expect(mockExec).toHaveBeenCalledWith(
        'which awslocal',
        expect.any(Function)
      );
      expect(mockConsoleLog).toHaveBeenCalledWith('[awslocal] AWS commands will use awslocal');
    });
    
    it('does nothing when disabled', async () => {
      // Re-initialize with disabled config
      const config: PluginConfig = { name: 'awslocal', enabled: true };
      const orcdkConfig: OrcdkConfig = {
        cdkRoot: 'cdk',
        deploymentStrategy: 'auto',
        environments: { 
          prod: { displayName: 'Production', isLocal: false }
        },
        plugins: [],
      };
      process.env.CDK_ENVIRONMENT = 'prod';
      await plugin.initialize(config, orcdkConfig);
      
      // Get the event handler from the mock
      const mockedCore = jest.requireMock('@orcdkestrator/core');
      const eventHandler = mockEventBus.on.mock.calls.find(
        (call: any[]) => call[0] === mockedCore.EventTypes['orchestrator:before:pattern-detection']
      )?.[1];
      
      await eventHandler();
      
      expect(mockExec).not.toHaveBeenCalled();
      expect(mockConsoleLog).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
    
    it('handles awslocal not found gracefully', async () => {
      mockExec.mockImplementation((cmd: any, cb: any) => {
        cb(new Error('command not found'), '', 'command not found');
        return {} as any;
      });
      
      // Get the event handler from the mock
      const mockedCore = jest.requireMock('@orcdkestrator/core');
      const eventHandler = mockEventBus.on.mock.calls.find(
        (call: any[]) => call[0] === mockedCore.EventTypes['orchestrator:before:pattern-detection']
      )?.[1];
      
      await eventHandler();
      
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[awslocal] awscli-local not found. AWS commands will use standard aws CLI.\n' +
        '  To enable LocalStack integration, install awscli-local: pip install awscli-local\n' +
        '  For more information, visit: https://github.com/localstack/awscli-local'
      );
    });
  });
});