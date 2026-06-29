import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataSourceService } from '../../../core/services/base-data-source.service';
import { ServiceCatalogMockService } from '../mocks/service-catalog.mock.service';
import { ServiceCatalogData } from '../models/service-catalog.models';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService extends BaseDataSourceService {
  private readonly mock = inject(ServiceCatalogMockService);

  constructor() { super('service-catalog'); }

  getServices(): Observable<ServiceCatalogData> {
    return this.fromSource('/catalog', () => this.mock.getServices());
  }
}
