import {
  Directive, Input, TemplateRef, ViewContainerRef,
  inject, OnInit, OnDestroy, effect,
} from '@angular/core';
import { PermissionService } from '../../core/services/permission.service';
import { Permission } from '../../core/models/rbac.models';

/**
 * *idpHasPermission structural directive.
 *
 * Removes the host element from the DOM when the current user lacks
 * the specified permission (Requirement 3.10).
 *
 * Usage:
 *   <button *idpHasPermission="'deployments:trigger'">Trigger</button>
 *   <div *idpHasPermission="['users:manage', 'organizations:manage']">Admin Panel</div>
 */
@Directive({
  selector: '[idpHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('idpHasPermission') permissions: Permission | Permission[] = [];

  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly permissionService = inject(PermissionService);
  private hasView = false;
  private effectRef: ReturnType<typeof effect> | null = null;

  ngOnInit(): void {
    this.effectRef = effect(() => {
      const allowed = this._evaluate();
      if (allowed && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!allowed && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.effectRef?.destroy();
  }

  private _evaluate(): boolean {
    const perms = Array.isArray(this.permissions) ? this.permissions : [this.permissions];
    if (perms.length === 0) return true;
    return this.permissionService.hasAllPermissions(perms);
  }
}
