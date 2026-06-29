import { TestBed } from '@angular/core/testing';
import { MockDataService } from './mock-data.service';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDataService);
  });

  it('uuid() should produce valid UUID-like strings', () => {
    const id = service.uuid();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('shortId() should produce prefixed IDs', () => {
    const id = service.shortId('dep');
    expect(id).toMatch(/^dep-\d{3}$/);
  });

  it('intBetween() should produce values within range', () => {
    for (let i = 0; i < 50; i++) {
      const val = service.intBetween(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('floatBetween() should produce values within range', () => {
    for (let i = 0; i < 50; i++) {
      const val = service.floatBetween(1.0, 5.0);
      expect(val).toBeGreaterThanOrEqual(1.0);
      expect(val).toBeLessThanOrEqual(5.0);
    }
  });

  it('timestamp() should produce valid ISO strings', () => {
    const ts = service.timestamp();
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it('userName() should produce non-empty strings', () => {
    const name = service.userName();
    expect(name.length).toBeGreaterThan(0);
    expect(name).toContain('.');
  });

  it('ipAddress() should look like IPv4', () => {
    const ip = service.ipAddress();
    expect(ip).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
  });

  it('version() should produce semver-like strings', () => {
    const ver = service.version();
    expect(ver).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('k8sNamespace() should return a known namespace', () => {
    const ns = service.k8sNamespace();
    expect(ns.length).toBeGreaterThan(0);
  });

  it('azureRegion() should return a known region', () => {
    const region = service.azureRegion();
    expect(region.length).toBeGreaterThan(0);
  });

  it('randomFrom() should always return an element from the array', () => {
    const items = ['a', 'b', 'c'];
    for (let i = 0; i < 30; i++) {
      expect(items).toContain(service.randomFrom(items));
    }
  });

  it('randomSubset() should return at most N elements', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const subset = service.randomSubset(items, 3);
    expect(subset.length).toBeLessThanOrEqual(3);
    subset.forEach((item) => expect(items).toContain(item));
  });

  it('serviceName() should return non-empty string', () => {
    expect(service.serviceName().length).toBeGreaterThan(0);
  });

  it('dockerImage() should include registry prefix', () => {
    expect(service.dockerImage()).toContain('registry.idp.internal/');
  });
});
