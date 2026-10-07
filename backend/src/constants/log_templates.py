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
    "FireDevice.writeback_qualified_components"
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
    "HazardTicket.close_blocked_before_confirm",
    "HazardTicket.close_after_confirm"
  ],
  "MaintenanceReceipt": [
    "MaintenanceReceipt.report",
    "MaintenanceReceipt.submit_failed",
    "MaintenanceReceipt.retry",
    "MaintenanceReceipt.match",
    "MaintenanceReceipt.queue_mismatch",
    "MaintenanceReceipt.supervisor_confirm",
    "MaintenanceReceipt.supervisor_reject"
  ]
}
