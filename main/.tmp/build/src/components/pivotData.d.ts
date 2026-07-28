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
    valueFields: PivotResolvedField[];
    filterFields: PivotResolvedField[];
    rowHeaders: PivotHeader[];
    columnHeaders: PivotHeader[];
    filters: PivotFilter[];
    /**
     * Nested lookup structure:
     *
     * row key
     *   -> column key
     *       -> aggregated value cell
     */
    cells: PivotCellMap;
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
export type PivotAggregation = "sum" | "count";
export interface PivotCell {
    rowKey: string;
    columnKey: string;
    /**
     * Final aggregated value displayed in the cell.
     */
    value: number;
    /**
     * Number of source records included in the cell.
     */
    sourceCount: number;
    aggregation: PivotAggregation;
}
export type PivotCellMap = Map<string, Map<string, PivotCell>>;
export interface PivotDataError {
    title: string;
    description: string;
}
/**
 * Used internally when no field has been assigned
 * to the Columns well.
 */
export declare const DEFAULT_COLUMN_KEY = "__pivot_default_column__";
/**
 * Builds a clean intermediate pivot model.
 *
 * This function:
 *
 * - resolves fields against Power BI table columns
 * - applies active filters
 * - creates unique row headers
 * - creates unique column headers
 * - aggregates one Values field
 *
 * It does not create HTML and does not mutate the
 * Power BI DataView.
 */
export declare function buildPivotModel(options: PivotDataOptions): PivotModel;
/**
 * Returns the aggregated cell for one row and column
 * intersection.
 *
 * When no Columns field is active, omit columnKey.
 */
export declare function getPivotCell(model: PivotModel, rowKey: string, columnKey?: string): PivotCell | undefined;
export declare function createValueKey(value: PrimitiveValue): string;
export declare function formatPivotValue(value: PrimitiveValue): string;
