/**
 * EcoFlow Executive Report Generator & CSV Exporter
 * Export audit logs, fleet data, and print Swachh Survekshan certificates
 */
window.EcoFlowReports = {
  exportCSV(dataType) {
    let filename = `ecoflow_${dataType}_report.csv`;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (dataType === 'fleet') {
      csvContent += "Vehicle ID,Registration,Driver,Status,Fuel Level,Capacity Utilized,Ward Assigned\n";
      csvContent += "TRK-01,KA-01-EQ-4402,Rajesh Kumar,ACTIVE,78%,85%,Ward 150 Bellandur\n";
      csvContent += "TRK-02,KA-01-EQ-1108,Suresh Patil,ACTIVE,92%,60%,Ward 174 HSR Layout\n";
      csvContent += "TRK-03,KA-01-EQ-9921,Amit Sharma,MAINTENANCE,45%,0%,Ward 12 Indiranagar\n";
    } else if (dataType === 'audits') {
      csvContent += "Ticket ID,Ward,Issue,Priority,Status,Filing Date,Resolution SLA\n";
      csvContent += "TICK-8842,Ward 150,Overflowing Bin,HIGH,DISPATCHED,2026-07-28,24h\n";
      csvContent += "TICK-8843,Ward 174,Missed Collection,MEDIUM,PENDING,2026-07-28,48h\n";
      csvContent += "TICK-8840,Ward 12,Illegal Dumping,CRITICAL,RESOLVED,2026-07-27,12h\n";
    } else {
      csvContent += "Customer Name,Ward,Collection Route,Waste Volume (Tons),Monthly Billing (INR),Payment Status\n";
      csvContent += "Prestige Tech Park,Ward 150,Route A1 - Commercial,14.2,₹48,500,PAID\n";
      csvContent += "Columbia Asia Hospital,Ward 174,Route B2 - BioMedical,8.6,₹62,000,PAID\n";
      csvContent += "Forum Mall,Ward 12,Route C3 - Mixed Dry,19.4,₹75,200,PENDING\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof Utils !== 'undefined') {
      Utils.showToast(`📊 Downloaded CSV Report: ${filename}`, 'success');
    }
  },

  printAuditReport() {
    window.print();
  }
};
