import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataSourceService } from '../../../core/services/base-data-source.service';
import { TerraformMockService } from '../mocks/terraform.mock.service';
import { TerraformData } from '../models/terraform.models';

@Injectable({ providedIn: 'root' })
export class TerraformService extends BaseDataSourceService {
  private readonly mock = inject(TerraformMockService);

  constructor() { super('terraform'); }

  getExecutions(): Observable<TerraformData> {
    return this.fromSource('/terraform/executions', () => this.mock.getExecutions());
  }
}
