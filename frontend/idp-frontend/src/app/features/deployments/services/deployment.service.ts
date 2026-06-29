import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataSourceService } from '../../../core/services/base-data-source.service';
import { DeploymentMockService } from '../mocks/deployment.mock.service';
import { DeploymentData } from '../models/deployment.models';

@Injectable({ providedIn: 'root' })
export class DeploymentService extends BaseDataSourceService {
  private readonly mock = inject(DeploymentMockService);

  constructor() { super('deployments'); }

  getDeployments(): Observable<DeploymentData> {
    return this.fromSource('/deployments', () => this.mock.getDeployments());
  }
}
