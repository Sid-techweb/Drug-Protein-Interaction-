import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ScreeningDashboard } from '../pages/ScreeningDashboard';
import { DatasetManagerPage } from '../pages/DatasetManagerPage';
import { DrugLibraryPage } from '../pages/DrugLibraryPage';
import { PredictionPage } from '../pages/PredictionPage';
import { QuantumPage } from '../pages/QuantumPage';
import { WorkflowPage } from '../pages/WorkflowPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ReportsPage } from '../pages/ReportsPage';
import { ExperimentHistoryPage } from '../pages/ExperimentHistoryPage';
import { ScientistValidationPage } from '../pages/ScientistValidationPage';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page Showcase */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected Workspace Routes (Requires Auth Context) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/screening" element={<ScreeningDashboard />} />
        <Route path="/datasets" element={<DatasetManagerPage />} />
        <Route path="/drugs" element={<DrugLibraryPage />} />
        <Route path="/predictions" element={<PredictionPage />} />
        <Route path="/quantum" element={<QuantumPage />} />
        <Route path="/validation" element={<ScientistValidationPage />} />
        <Route path="/workflow" element={<WorkflowPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/history" element={<ExperimentHistoryPage />} />
      </Route>

      {/* Guest Authentication Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
