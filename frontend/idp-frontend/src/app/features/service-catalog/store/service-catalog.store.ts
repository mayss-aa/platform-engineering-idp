import { Injectable, inject, OnDestroy } from '@angular/core';
import { BaseResourceStore } from '../../../core/stores/base-resource.store';
import { ServiceCatalogService } from '../services/service-catalog.service';
import { ServiceCatalogData } from '../models/service-catalog.models';

@Injectable({ providedIn: 'root' })
export class ServiceCatalogStore implements OnDestroy {
  private readonly service = inject(ServiceCatalogService);
  readonly catalog = new BaseResourceStore<ServiceCatalogData>();

  load(): void { this.catalog.load(this.service.getServices()); }
  retry(): void { this.catalog.retry(this.service.getServices()); }
  ngOnDestroy(): void { this.catalog.destroy(); }
}
