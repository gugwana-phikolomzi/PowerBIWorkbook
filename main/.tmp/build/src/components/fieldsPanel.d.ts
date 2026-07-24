import powerbi from "powerbi-visuals-api";
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
export type FieldDataType = "date" | "number" | "text" | "boolean" | "geography";
export interface AnalyticsField {
    id: string;
    name: string;
    type: FieldDataType;
    isMeasure: boolean;
}
export interface FieldsPanelOptions {
    fields: AnalyticsField[];
    onFieldDragStart?: (field: AnalyticsField, event: DragEvent) => void;
    onFieldDragEnd?: (field: AnalyticsField, event: DragEvent) => void;
}
export declare function buildFieldsFromMetadata(columns?: DataViewMetadataColumn[]): AnalyticsField[];
export declare function renderFieldsPanel(options: FieldsPanelOptions): HTMLElement;
