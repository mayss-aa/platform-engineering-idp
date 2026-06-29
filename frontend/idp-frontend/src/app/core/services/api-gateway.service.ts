import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Optional request configuration for API calls. */
export interface ApiRequestOptions {
  params?: HttpParams | Record<string, string | string[]>;
  headers?: HttpHeaders | Record<string, string | string[]>;
}

/**
 * ApiGatewayService — centralized HTTP layer.
 *
 * Responsibilities (Requirement 2.7, 27.3):
 * - All HTTP communication goes through this service.
 * - No component or store ever calls HttpClient directly.
 * - Typed wrapper methods: get, post, put, patch, delete, downloadBlob.
 * - Base URL is resolved from environment.apiBaseUrl.
 * - JWT token attachment is handled by the jwtInterceptor — not here.
 */
@Injectable({ providedIn: 'root' })
export class ApiGatewayService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /** Build the full endpoint URL. */
  private url(path: string): string {
    // Ensure no double slashes when path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  /** HTTP GET returning typed Observable. */
  get<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.url(path), {
      params: options?.params,
      headers: options?.headers,
    });
  }

  /** HTTP POST returning typed Observable. */
  post<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.url(path), body, {
      params: options?.params,
      headers: options?.headers,
    });
  }

  /** HTTP PUT returning typed Observable. */
  put<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.url(path), body, {
      params: options?.params,
      headers: options?.headers,
    });
  }

  /** HTTP PATCH returning typed Observable. */
  patch<T>(path: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.url(path), body, {
      params: options?.params,
      headers: options?.headers,
    });
  }

  /** HTTP DELETE returning typed Observable. */
  delete<T>(path: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.url(path), {
      params: options?.params,
      headers: options?.headers,
    });
  }

  /** Download a binary blob (CSV export, file download). */
  downloadBlob(path: string, options?: ApiRequestOptions): Observable<Blob> {
    return this.http.get(this.url(path), {
      params: options?.params,
      headers: options?.headers,
      responseType: 'blob',
    });
  }
}
