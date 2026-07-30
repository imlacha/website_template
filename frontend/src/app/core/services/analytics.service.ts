import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/analytics.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>('/api/admin/analytics/stats');
  }
}
