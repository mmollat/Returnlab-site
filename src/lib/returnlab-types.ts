export type ReturnRecord = {
  id: number;
  client_name: string;
  date_received: string;
  tracking_number: string | null;
  carrier: string;
  item_sku: string | null;
  qty: number;
  condition: string;
  return_reason: string | null;
  action_taken: string;
  status: string;
  time_spent_minutes: number | null;
  estimated_resale_value: number | null;
  storage_until: string | null;
  photo_link: string | null;
  notes: string | null;
  inspector_name: string | null;
  inspected_at: string | null;
  inspection_outcome: InspectionOutcome | null;
  inspection_findings: Record<string, boolean>;
  inspection_notes: string | null;
  repackaged: boolean | null;
  replacement_poly_bag_used: boolean | null;
  outbound_label_received: boolean | null;
  outbound_status: OutboundStatus | null;
  returnlab_return_photos?: ReturnPhotoRecord[];
  created_at: string;
  updated_at: string;
};

export type InspectionOutcome =
  | "Approved for resale"
  | "Client review required"
  | "Not approved"
  | "Unable to determine";

export type OutboundStatus =
  | "Not requested"
  | "Awaiting client instructions"
  | "Awaiting prepaid label"
  | "Ready for carrier"
  | "Tendered to carrier";

export type ReturnPhotoRecord = {
  id: number;
  return_id: number;
  storage_path: string;
  photo_category: string;
  original_filename: string | null;
  content_type: string;
  size_bytes: number;
  created_at: string;
  signed_url?: string;
};

export type ReturnInput = {
  clientName: string;
  dateReceived: string;
  trackingNumber?: string;
  carrier: string;
  itemSku?: string;
  qty: number;
  condition: string;
  returnReason?: string;
  actionTaken: string;
  status: string;
  timeSpent?: string | number;
  estimatedResaleValue?: string | number;
  storageUntil?: string;
  photoLink?: string;
  notes?: string;
  inspectorName?: string;
  inspectionOutcome?: InspectionOutcome | "";
  inspectionFindings?: Record<string, boolean>;
  inspectionNotes?: string;
  repackaged?: boolean | null;
  replacementPolyBagUsed?: boolean | null;
  outboundLabelReceived?: boolean | null;
  outboundStatus?: OutboundStatus | "";
};

export type RecentReturn = {
  id?: number;
  dateReceived?: string;
  trackingNumber?: string;
  carrier?: string;
  itemSku?: string;
  qty?: number;
  actionTaken?: string;
  status?: string;
  notes?: string;
  inspectionOutcome?: InspectionOutcome;
  inspectionFindings?: Record<string, boolean>;
  inspectionNotes?: string;
  inspectorName?: string;
  outboundStatus?: OutboundStatus;
  photos?: Array<{
    id: number;
    category: string;
    url: string;
  }>;
};

export type ReportData = {
  business?: string;
  client?: string;
  month?: string;
  generatedAt?: string;
  totalRows?: number;
  totalReturns?: number;
  kept?: number;
  disposed?: number;
  keepRate?: number;
  disposedRate?: number;
  totalTimeMinutes?: number;
  avgMinutesPerReturn?: number;
  estimatedResaleValue?: number;
  baseFee?: number;
  includedReturns?: number;
  additionalReturns?: number;
  additionalFees?: number;
  outboundItems?: number;
  outboundHandlingFees?: number;
  totalDue?: number;
  recentReturns?: RecentReturn[];
};

export type ReportRow = {
  id: string;
  client_name: string;
  report_month: string;
  report_data: ReportData;
  created_at: string;
  updated_at: string;
};
