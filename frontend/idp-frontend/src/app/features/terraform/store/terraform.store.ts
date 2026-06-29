import { Injectable, inject, OnDestroy } from '@angular/core';
import { BaseResourceStore } from '../../../core/stores/base-resource.store';
import { TerraformService } from '../services/terraform.service';
import { TerraformData } from '../models/terraform.models';

@Injectable({ providedIn: 'root' })
export class TerraformStore implements OnDestroy {
  private readonly service = inject(TerraformService);
  readonly executions = new BaseResourceStore<TerraformData>();

  load(): void { this.executions.load(this.service.getExecutions()); }
  retry(): void { this.executions.retry(this.service.getExecutions()); }
  ngOnDestroy(): void { this.executions.destroy(); }
}
