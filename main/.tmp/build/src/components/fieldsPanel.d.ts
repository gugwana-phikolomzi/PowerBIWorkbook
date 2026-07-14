import powerbi from "powerbi-visuals-api";
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
export type FieldDataType = "date" | "number" | "text" | "boolean" | "geography";
export interface AnalyticsField {
    id: string;
    name: string;
    groupName: string;
    type: FieldDataType;
    isMeasure: boolean;
    selected: boolean;
}
export interface FieldGroup {
    name: string;
    icon: string;
    fields: AnalyticsField[];
}
export interface FieldsPanelOptions {
    fields: AnalyticsField[];
    onFieldSelectionChange?: (field: AnalyticsField, selected: boolean) => void;
}
export declare function buildFieldsFromMetadata(columns?: DataViewMetadataColumn[]): AnalyticsField[];
export declare function renderFieldsPanel(options: FieldsPanelOptions): HTMLElement;
