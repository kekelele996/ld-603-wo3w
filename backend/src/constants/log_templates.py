LOG_TEMPLATES = {
  "Building": [
    "Building.create",
    "Building.update",
    "Building.status",
    "Building.export"
  ],
  "FireDevice": [
    "FireDevice.create",
    "FireDevice.update",
    "FireDevice.status",
    "FireDevice.export",
    "FireDevice.writeQualifiedPartCount"
  ],
  "InspectionTask": [
    "InspectionTask.create",
    "InspectionTask.update",
    "InspectionTask.status",
    "InspectionTask.export"
  ],
  "InspectionResult": [
    "InspectionResult.create",
    "InspectionResult.update",
    "InspectionResult.status",
    "InspectionResult.export"
  ],
  "HazardTicket": [
    "HazardTicket.create",
    "HazardTicket.update",
    "HazardTicket.status",
    "HazardTicket.export",
    "HazardTicket.blockCloseBeforeReconciled"
  ],
  "MaintenanceReceipt": [
    "MaintenanceReceipt.submit",
    "MaintenanceReceipt.retry",
    "MaintenanceReceipt.match",
    "MaintenanceReceipt.confirm",
    "MaintenanceReceipt.reject"
  ],
  "AuditLog": [
    "AuditLog.query"
  ]
}
