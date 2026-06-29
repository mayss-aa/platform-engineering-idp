import { Injectable, inject, OnDestroy } from '@angular/core';
import { BaseResourceStore } from '../../../core/stores/base-resource.store';
import { DeploymentService } from '../services/deployment.service';
import { DeploymentData } from '../models/deployment.models';

@Injectable({ providedIn: 'root' })
export class DeploymentStore implements OnDestroy {
  private readonly service = inject(DeploymentService);
  readonly deployments = new BaseResourceStore<DeploymentData>();

  load(): void { this.deployments.load(this.service.getDeployments()); }
  retry(): void { this.deployments.retry(this.service.getDeployments()); }
  ngOnDestroy(): void { this.deployments.destroy(); }
}
