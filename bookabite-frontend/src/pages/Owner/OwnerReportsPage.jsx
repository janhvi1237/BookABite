import React from 'react';
import StatisticsReport from '../../components/reports/StatisticsReport';
import './OwnerPages.css';

export default function OwnerReportsPage() {
  return (
    <div className="bab-owner-page">
      <main className="bab-container bab-owner-container">
        <header className="bab-owner-header">
          <div>
            <span className="bab-section-eyebrow">BUSINESS INSIGHTS</span>
            <h1 className="bab-owner-title">Statistics Reports</h1>
            <p>Review booking, guest, fee and review activity across your restaurants.</p>
          </div>
        </header>
        <StatisticsReport />
      </main>
    </div>
  );
}
