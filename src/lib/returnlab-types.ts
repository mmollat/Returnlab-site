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
  created_at: string;
  updated_at: string;
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
};

export type RecentReturn = {
  dateReceived?: string;
  trackingNumber?: string;
  carrier?: string;
  itemSku?: string;
  qty?: number;
  actionTaken?: string;
  status?: string;
  notes?: string;
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
