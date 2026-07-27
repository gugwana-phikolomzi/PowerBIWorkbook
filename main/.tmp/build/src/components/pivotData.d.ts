import powerbi from "powerbi-visuals-api";
import { AnalyticsField } from "./fieldsPanel";
import { FieldWellsState } from "./fieldWells";
import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
export interface PivotDataOptions {
    dataView?: DataView;
    fieldWellsState: FieldWellsState;
    /**
     * Selected filter values keyed by AnalyticsField.id.
     *
     * A missing field ID means that all values are selected
     * for that filter.
     */
    selectedFilterValues?: ReadonlyMap<string, string>;
}
export interface PivotModel {
    rowFields: PivotResolvedField[];
    columnFields: PivotResolvedField[];
    filterFields: PivotResolvedField[];
    rowHeaders: PivotHeader[];
    columnHeaders: PivotHeader[];
    filters: PivotFilter[];
    sourceRowCount: number;
    filteredRowCount: number;
    error?: PivotDataError;
}
export interface PivotResolvedField {
    field: AnalyticsField;
    column: DataViewMetadataColumn;
    columnIndex: number;
}
export interface PivotHeader {
    key: string;
    values: PrimitiveValue[];
    label: string;
}
export interface PivotFilter {
    field: AnalyticsField;
    columnIndex: number;
    options: PivotFilterOption[];
    selectedKey?: string;
}
export interface PivotFilterOption {
    key: string;
    value: PrimitiveValue;
    label: string;
}
export interface PivotDataError {
    title: string;
    description: string;
}
/**
 * Builds a clean intermediate pivot model.
 *
 * This function does not create HTML and does not mutate the
 * Power BI DataView.
 */
export declare function buildPivotModel(options: PivotDataOptions): PivotModel;
export declare function createValueKey(value: PrimitiveValue): string;
export declare function formatPivotValue(value: PrimitiveValue): string;
