import { Injectable, inject, OnDestroy } from '@angular/core';
import { BaseResourceStore } from '../../../core/stores/base-resource.store';
import { ProvisionRequestService } from '../services/provision-request.service';
import { ProvisionRequestData } from '../models/provision-request.models';

@Injectable({ providedIn: 'root' })
export class ProvisionRequestStore implements OnDestroy {
  private readonly service = inject(ProvisionRequestService);
  readonly requests = new BaseResourceStore<ProvisionRequestData>();

  load(): void { this.requests.load(this.service.getRequests()); }
  retry(): void { this.requests.retry(this.service.getRequests()); }
  ngOnDestroy(): void { this.requests.destroy(); }
}
