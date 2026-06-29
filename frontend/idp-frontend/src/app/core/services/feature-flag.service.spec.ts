import { TestBed } from '@angular/core/testing';
import { FeatureFlagService } from './feature-flag.service';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureFlagService);
  });

  it('should have all 19 module flags pre-populated', () => {
    const flags = service.getAllFlags();
    expect(Object.keys(flags).length).toBeGreaterThanOrEqual(19);
  });

  it('should default all modules to MOCK in dev environment', () => {
    expect(service.getReadinessLevel('dashboard')).toBe('MOCK');
    expect(service.getReadinessLevel('deployments')).toBe('MOCK');
    expect(service.getReadinessLevel('kubernetes')).toBe('MOCK');
    expect(service.getReadinessLevel('ai-assistant')).toBe('MOCK');
  });

  it('should return MOCK for unknown feature names', () => {
    expect(service.getReadinessLevel('nonexistent-feature')).toBe('MOCK');
  });

  it('isMock and isLive should be consistent', () => {
    expect(service.isMock('dashboard')).toBe(true);
    expect(service.isLive('dashboard')).toBe(false);
  });

  it('should allow runtime flag override', () => {
    service._overrideFlag('dashboard', 'LIVE');
    expect(service.getReadinessLevel('dashboard')).toBe('LIVE');
    expect(service.isLive('dashboard')).toBe(true);
    expect(service.isMock('dashboard')).toBe(false);
  });

  it('initialize() should be idempotent', () => {
    service.initialize();
    service.initialize();
    expect(service.getReadinessLevel('dashboard')).toBe('MOCK');
  });

  it('per-module computed signals should reflect current flags', () => {
    expect(service.dashboard()).toBe('MOCK');
    expect(service.deployments()).toBe('MOCK');
    service._overrideFlag('deployments', 'LIVE');
    expect(service.deployments()).toBe('LIVE');
  });
});
