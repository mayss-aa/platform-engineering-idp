import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataSourceService } from '../../../core/services/base-data-source.service';
import { ProvisionRequestMockService } from '../mocks/provision-request.mock.service';
import { ProvisionRequestData } from '../models/provision-request.models';

@Injectable({ providedIn: 'root' })
export class ProvisionRequestService extends BaseDataSourceService {
  private readonly mock = inject(ProvisionRequestMockService);

  constructor() { super('provision-requests'); }

  getRequests(): Observable<ProvisionRequestData> {
    return this.fromSource('/requests', () => this.mock.getRequests());
  }
}
