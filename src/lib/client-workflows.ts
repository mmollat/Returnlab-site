export const CLIENT_NAMES = ["CTH", "DGM Group"] as const;

export type ClientName = (typeof CLIENT_NAMES)[number];

export type InspectionQuestion = {
  key: string;
  label: string;
};

export type PhotoCategory =
  | "Front view"
  | "Back view"
  | "Product label"
  | "Packaging"
  | "Issue close-up"
  | "Additional";

export type ClientWorkflow = {
  name: ClientName;
  inspectionTitle: string;
  inspectionDescription: string;
  questions: InspectionQuestion[];
  photoCategories: PhotoCategory[];
  photosRequired: boolean;
  showEstimatedResaleValue: boolean;
  showOutboundHandling: boolean;
};

export const CLIENT_WORKFLOWS: Record<ClientName, ClientWorkflow> = {
  CTH: {
    name: "CTH",
    inspectionTitle: "CTH condition assessment",
    inspectionDescription:
      "Record the condition and operational details used by the existing CTH workflow.",
    questions: [],
    photoCategories: ["Issue close-up", "Additional"],
    photosRequired: false,
    showEstimatedResaleValue: true,
    showOutboundHandling: false,
  },
  "DGM Group": {
    name: "DGM Group",
    inspectionTitle: "DGM sofa-cover inspection",
    inspectionDescription:
      "Mark each issue observed during the textile inspection. ReturnLab does not clean or launder products.",
    questions: [
      { key: "petHair", label: "Pet hair" },
      { key: "signsOfUse", label: "Signs of use" },
      { key: "odor", label: "Odor" },
      { key: "stains", label: "Stains" },
      { key: "tears", label: "Tears" },
      { key: "holes", label: "Holes" },
      { key: "otherVisibleDamage", label: "Other visible damage" },
      { key: "packagingDamaged", label: "Packaging damaged" },
    ],
    photoCategories: [
      "Front view",
      "Back view",
      "Product label",
      "Packaging",
      "Issue close-up",
      "Additional",
    ],
    photosRequired: false,
    showEstimatedResaleValue: false,
    showOutboundHandling: true,
  },
};

export function isClientName(value: string): value is ClientName {
  return CLIENT_NAMES.includes(value as ClientName);
}

export const PHOTO_CATEGORIES = [
  "Front view",
  "Back view",
  "Product label",
  "Packaging",
  "Issue close-up",
  "Additional",
] as const satisfies readonly PhotoCategory[];

export function isPhotoCategory(value: string): value is PhotoCategory {
  return PHOTO_CATEGORIES.includes(value as PhotoCategory);
}
