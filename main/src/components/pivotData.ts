// "use strict";

// import powerbi from "powerbi-visuals-api";

// import {
//     AnalyticsField,
// } from "./fieldsPanel";

// import {
//     FieldWellsState,
// } from "./fieldWells";

// import DataView =
//     powerbi.DataView;

// import DataViewMetadataColumn =
//     powerbi.DataViewMetadataColumn;

// import PrimitiveValue =
//     powerbi.PrimitiveValue;

// export interface PivotDataOptions {
//     dataView?: DataView;
//     fieldWellsState: FieldWellsState;

//     /**
//      * Selected filter values keyed by AnalyticsField.id.
//      *
//      * A missing field ID means that all values are selected
//      * for that filter.
//      */
//     selectedFilterValues?: ReadonlyMap<
//         string,
//         string
//     >;
// }

// export interface PivotModel {
//     rowFields: PivotResolvedField[];
//     columnFields: PivotResolvedField[];
//     filterFields: PivotResolvedField[];

//     rowHeaders: PivotHeader[];
//     columnHeaders: PivotHeader[];

//     filters: PivotFilter[];

//     sourceRowCount: number;
//     filteredRowCount: number;

//     error?: PivotDataError;
// }

// export interface PivotResolvedField {
//     field: AnalyticsField;
//     column: DataViewMetadataColumn;
//     columnIndex: number;
// }

// export interface PivotHeader {
//     key: string;
//     values: PrimitiveValue[];
//     label: string;
// }

// export interface PivotFilter {
//     field: AnalyticsField;
//     columnIndex: number;
//     options: PivotFilterOption[];
//     selectedKey?: string;
// }

// export interface PivotFilterOption {
//     key: string;
//     value: PrimitiveValue;
//     label: string;
// }

// export interface PivotDataError {
//     title: string;
//     description: string;
// }

// /**
//  * Builds a clean intermediate pivot model.
//  *
//  * This function does not create HTML and does not mutate the
//  * Power BI DataView.
//  */
// export function buildPivotModel(
//     options: PivotDataOptions
// ): PivotModel {
//     const {
//         dataView,
//         fieldWellsState,
//         selectedFilterValues =
//             new Map<string, string>(),
//     } = options;

//     const emptyModel =
//         createEmptyPivotModel();

//     if (!dataView) {
//         return {
//             ...emptyModel,

//             error: {
//                 title:
//                     "No data available",

//                 description:
//                     "Add data to the visual to begin.",
//             },
//         };
//     }

//     const tableData =
//         dataView.table;

//     if (
//         !tableData ||
//         !tableData.columns?.length
//     ) {
//         return {
//             ...emptyModel,

//             error: {
//                 title:
//                     "No table data available",

//                 description:
//                     "Power BI did not return table columns for the visual.",
//             },
//         };
//     }

//     const sourceRows =
//         tableData.rows ?? [];

//     const rowFields =
//         resolveFields(
//             fieldWellsState.rows,
//             tableData.columns
//         );

//     const columnFields =
//         resolveFields(
//             fieldWellsState.columns,
//             tableData.columns
//         );

//     const filterFields =
//         resolveFields(
//             fieldWellsState.filters,
//             tableData.columns
//         );

//     const unresolvedRowFields =
//         findUnresolvedFields(
//             fieldWellsState.rows,
//             rowFields
//         );

//     if (
//         unresolvedRowFields.length > 0
//     ) {
//         return {
//             ...emptyModel,

//             rowFields,
//             columnFields,
//             filterFields,

//             sourceRowCount:
//                 sourceRows.length,

//             error: {
//                 title:
//                     "Row field unavailable",

//                 description:
//                     createUnavailableFieldMessage(
//                         unresolvedRowFields
//                     ),
//             },
//         };
//     }

//     const unresolvedColumnFields =
//         findUnresolvedFields(
//             fieldWellsState.columns,
//             columnFields
//         );

//     if (
//         unresolvedColumnFields.length > 0
//     ) {
//         return {
//             ...emptyModel,

//             rowFields,
//             columnFields,
//             filterFields,

//             sourceRowCount:
//                 sourceRows.length,

//             error: {
//                 title:
//                     "Column field unavailable",

//                 description:
//                     createUnavailableFieldMessage(
//                         unresolvedColumnFields
//                     ),
//             },
//         };
//     }

//     const unresolvedFilterFields =
//         findUnresolvedFields(
//             fieldWellsState.filters,
//             filterFields
//         );

//     if (
//         unresolvedFilterFields.length > 0
//     ) {
//         return {
//             ...emptyModel,

//             rowFields,
//             columnFields,
//             filterFields,

//             sourceRowCount:
//                 sourceRows.length,

//             error: {
//                 title:
//                     "Filter field unavailable",

//                 description:
//                     createUnavailableFieldMessage(
//                         unresolvedFilterFields
//                     ),
//             },
//         };
//     }

//     const filters =
//         buildFilters(
//             sourceRows,
//             filterFields,
//             selectedFilterValues
//         );

//     const filteredRows =
//         applyFilters(
//             sourceRows,
//             filterFields,
//             selectedFilterValues
//         );

//     const rowHeaders =
//         createUniqueHeaders(
//             filteredRows,
//             rowFields
//         );

//     const columnHeaders =
//         createUniqueHeaders(
//             filteredRows,
//             columnFields
//         );

//     return {
//         rowFields,
//         columnFields,
//         filterFields,

//         rowHeaders,
//         columnHeaders,

//         filters,

//         sourceRowCount:
//             sourceRows.length,

//         filteredRowCount:
//             filteredRows.length,
//     };
// }

// export function createValueKey(
//     value: PrimitiveValue
// ): string {
//     if (
//         value === null ||
//         value === undefined
//     ) {
//         return "null:";
//     }

//     if (value instanceof Date) {
//         return `date:${value.toISOString()}`;
//     }

//     return `${typeof value}:${String(
//         value
//     )}`;
// }

// export function formatPivotValue(
//     value: PrimitiveValue
// ): string {
//     if (
//         value === null ||
//         value === undefined ||
//         value === ""
//     ) {
//         return "(Blank)";
//     }

//     if (value instanceof Date) {
//         return value.toLocaleDateString(
//             "en-US"
//         );
//     }

//     if (
//         typeof value === "number"
//     ) {
//         return value.toLocaleString(
//             "en-US"
//         );
//     }

//     if (
//         typeof value === "boolean"
//     ) {
//         return value
//             ? "True"
//             : "False";
//     }

//     return String(value);
// }

// function createEmptyPivotModel():
//     PivotModel {
//     return {
//         rowFields: [],
//         columnFields: [],
//         filterFields: [],

//         rowHeaders: [],
//         columnHeaders: [],

//         filters: [],

//         sourceRowCount: 0,
//         filteredRowCount: 0,
//     };
// }

// function resolveFields(
//     requestedFields: AnalyticsField[],
//     columns: DataViewMetadataColumn[]
// ): PivotResolvedField[] {
//     const resolvedFields:
//         PivotResolvedField[] = [];

//     requestedFields.forEach(
//         (field) => {
//             const columnIndex =
//                 findColumnIndex(
//                     field,
//                     columns
//                 );

//             if (
//                 columnIndex < 0
//             ) {
//                 return;
//             }

//             resolvedFields.push({
//                 field,

//                 column:
//                     columns[columnIndex],

//                 columnIndex,
//             });
//         }
//     );

//     return resolvedFields;
// }

// function findColumnIndex(
//     field: AnalyticsField,
//     columns: DataViewMetadataColumn[]
// ): number {
//     return columns.findIndex(
//         (column) => {
//             if (
//                 column.queryName &&
//                 column.queryName ===
//                     field.id
//             ) {
//                 return true;
//             }

//             if (
//                 column.displayName ===
//                 field.name
//             ) {
//                 return true;
//             }

//             return false;
//         }
//     );
// }

// function findUnresolvedFields(
//     requestedFields: AnalyticsField[],
//     resolvedFields: PivotResolvedField[]
// ): AnalyticsField[] {
//     const resolvedFieldIds =
//         new Set(
//             resolvedFields.map(
//                 ({ field }) =>
//                     field.id
//             )
//         );

//     return requestedFields.filter(
//         (field) =>
//             !resolvedFieldIds.has(
//                 field.id
//             )
//     );
// }

// function createUnavailableFieldMessage(
//     fields: AnalyticsField[]
// ): string {
//     const fieldNames =
//         fields
//             .map(
//                 (field) =>
//                     field.name
//             )
//             .join(", ");

//     return (
//         `Power BI did not return data for: ` +
//         `${fieldNames}.`
//     );
// }

// function createUniqueHeaders(
//     sourceRows: PrimitiveValue[][],
//     fields: PivotResolvedField[]
// ): PivotHeader[] {
//     if (
//         fields.length === 0
//     ) {
//         return [];
//     }

//     const uniqueHeaders =
//         new Map<
//             string,
//             PivotHeader
//         >();

//     sourceRows.forEach(
//         (sourceRow) => {
//             const values =
//                 fields.map(
//                     ({ columnIndex }) =>
//                         sourceRow[
//                             columnIndex
//                         ]
//                 );

//             const key =
//                 createHeaderKey(
//                     values
//                 );

//             if (
//                 uniqueHeaders.has(key)
//             ) {
//                 return;
//             }

//             uniqueHeaders.set(
//                 key,
//                 {
//                     key,
//                     values,

//                     label:
//                         values
//                             .map(
//                                 formatPivotValue
//                             )
//                             .join(" / "),
//                 }
//             );
//         }
//     );

//     return Array.from(
//         uniqueHeaders.values()
//     );
// }

// function createHeaderKey(
//     values: PrimitiveValue[]
// ): string {
//     return JSON.stringify(
//         values.map(
//             createValueKey
//         )
//     );
// }

// function buildFilters(
//     sourceRows: PrimitiveValue[][],
//     filterFields: PivotResolvedField[],
//     selectedFilterValues: ReadonlyMap<
//         string,
//         string
//     >
// ): PivotFilter[] {
//     return filterFields.map(
//         (resolvedField) => {
//             const options =
//                 createFilterOptions(
//                     sourceRows,
//                     resolvedField
//                 );

//             const selectedKey =
//                 selectedFilterValues.get(
//                     resolvedField.field.id
//                 );

//             const selectedKeyExists =
//                 selectedKey !==
//                     undefined &&
//                 options.some(
//                     (option) =>
//                         option.key ===
//                         selectedKey
//                 );

//             return {
//                 field:
//                     resolvedField.field,

//                 columnIndex:
//                     resolvedField.columnIndex,

//                 options,

//                 selectedKey:
//                     selectedKeyExists
//                         ? selectedKey
//                         : undefined,
//             };
//         }
//     );
// }

// function createFilterOptions(
//     sourceRows: PrimitiveValue[][],
//     resolvedField: PivotResolvedField
// ): PivotFilterOption[] {
//     const uniqueOptions =
//         new Map<
//             string,
//             PivotFilterOption
//         >();

//     sourceRows.forEach(
//         (sourceRow) => {
//             const value =
//                 sourceRow[
//                     resolvedField.columnIndex
//                 ];

//             const key =
//                 createValueKey(
//                     value
//                 );

//             if (
//                 uniqueOptions.has(key)
//             ) {
//                 return;
//             }

//             uniqueOptions.set(
//                 key,
//                 {
//                     key,
//                     value,

//                     label:
//                         formatPivotValue(
//                             value
//                         ),
//                 }
//             );
//         }
//     );

//     return Array.from(
//         uniqueOptions.values()
//     ).sort(
//         (
//             first,
//             second
//         ) =>
//             first.label.localeCompare(
//                 second.label,
//                 undefined,
//                 {
//                     numeric: true,
//                     sensitivity: "base",
//                 }
//             )
//     );
// }

// function applyFilters(
//     sourceRows: PrimitiveValue[][],
//     filterFields: PivotResolvedField[],
//     selectedFilterValues: ReadonlyMap<
//         string,
//         string
//     >
// ): PrimitiveValue[][] {
//     if (
//         filterFields.length === 0 ||
//         selectedFilterValues.size === 0
//     ) {
//         return sourceRows;
//     }

//     return sourceRows.filter(
//         (sourceRow) =>
//             filterFields.every(
//                 (resolvedField) => {
//                     const selectedKey =
//                         selectedFilterValues.get(
//                             resolvedField.field.id
//                         );

//                     if (
//                         selectedKey ===
//                         undefined
//                     ) {
//                         return true;
//                     }

//                     const sourceValue =
//                         sourceRow[
//                             resolvedField.columnIndex
//                         ];

//                     return (
//                         createValueKey(
//                             sourceValue
//                         ) ===
//                         selectedKey
//                     );
//                 }
//             )
//     );
// }



"use strict";

import powerbi from "powerbi-visuals-api";

import {
    AnalyticsField,
} from "./fieldsPanel";

import {
    FieldWellsState,
} from "./fieldWells";

import DataView =
    powerbi.DataView;

import DataViewMetadataColumn =
    powerbi.DataViewMetadataColumn;

import PrimitiveValue =
    powerbi.PrimitiveValue;

export interface PivotDataOptions {
    dataView?: DataView;
    fieldWellsState: FieldWellsState;

    /**
     * Selected filter values keyed by AnalyticsField.id.
     *
     * A missing field ID means that all values are selected
     * for that filter.
     */
    selectedFilterValues?: ReadonlyMap<
        string,
        string
    >;
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

export type PivotAggregation =
    | "sum"
    | "count";

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

export type PivotCellMap =
    Map<
        string,
        Map<string, PivotCell>
    >;

export interface PivotDataError {
    title: string;
    description: string;
}

/**
 * Used internally when no field has been assigned
 * to the Columns well.
 */
export const DEFAULT_COLUMN_KEY =
    "__pivot_default_column__";

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
export function buildPivotModel(
    options: PivotDataOptions
): PivotModel {
    const {
        dataView,
        fieldWellsState,
        selectedFilterValues =
            new Map<string, string>(),
    } = options;

    const emptyModel =
        createEmptyPivotModel();

    if (!dataView) {
        return {
            ...emptyModel,

            error: {
                title:
                    "No data available",

                description:
                    "Add data to the visual to begin.",
            },
        };
    }

    const tableData =
        dataView.table;

    if (
        !tableData ||
        !tableData.columns?.length
    ) {
        return {
            ...emptyModel,

            error: {
                title:
                    "No table data available",

                description:
                    "Power BI did not return table columns for the visual.",
            },
        };
    }

    const sourceRows =
        tableData.rows ?? [];

    const rowFields =
        resolveFields(
            fieldWellsState.rows,
            tableData.columns
        );

    const columnFields =
        resolveFields(
            fieldWellsState.columns,
            tableData.columns
        );

    const valueFields =
        resolveFields(
            fieldWellsState.values,
            tableData.columns
        );

    const filterFields =
        resolveFields(
            fieldWellsState.filters,
            tableData.columns
        );

    const baseModel: PivotModel = {
        ...emptyModel,

        rowFields,
        columnFields,
        valueFields,
        filterFields,

        sourceRowCount:
            sourceRows.length,
    };

    const unresolvedRowFields =
        findUnresolvedFields(
            fieldWellsState.rows,
            rowFields
        );

    if (
        unresolvedRowFields.length > 0
    ) {
        return {
            ...baseModel,

            error: {
                title:
                    "Row field unavailable",

                description:
                    createUnavailableFieldMessage(
                        unresolvedRowFields
                    ),
            },
        };
    }

    const unresolvedColumnFields =
        findUnresolvedFields(
            fieldWellsState.columns,
            columnFields
        );

    if (
        unresolvedColumnFields.length > 0
    ) {
        return {
            ...baseModel,

            error: {
                title:
                    "Column field unavailable",

                description:
                    createUnavailableFieldMessage(
                        unresolvedColumnFields
                    ),
            },
        };
    }

    const unresolvedValueFields =
        findUnresolvedFields(
            fieldWellsState.values,
            valueFields
        );

    if (
        unresolvedValueFields.length > 0
    ) {
        return {
            ...baseModel,

            error: {
                title:
                    "Value field unavailable",

                description:
                    createUnavailableFieldMessage(
                        unresolvedValueFields
                    ),
            },
        };
    }

    const unresolvedFilterFields =
        findUnresolvedFields(
            fieldWellsState.filters,
            filterFields
        );

    if (
        unresolvedFilterFields.length > 0
    ) {
        return {
            ...baseModel,

            error: {
                title:
                    "Filter field unavailable",

                description:
                    createUnavailableFieldMessage(
                        unresolvedFilterFields
                    ),
            },
        };
    }

    if (valueFields.length > 1) {
        return {
            ...baseModel,

            error: {
                title:
                    "Multiple value fields are not supported yet",

                description:
                    "Keep one field in Values while this capability is being added.",
            },
        };
    }

    const filters =
        buildFilters(
            sourceRows,
            filterFields,
            selectedFilterValues
        );

    const filteredRows =
        applyFilters(
            sourceRows,
            filterFields,
            selectedFilterValues
        );

    const rowHeaders =
        createUniqueHeaders(
            filteredRows,
            rowFields
        );

    const columnHeaders =
        createUniqueHeaders(
            filteredRows,
            columnFields
        );

    const cells =
        valueFields.length === 1
            ? buildValueCells(
                filteredRows,
                rowFields,
                columnFields,
                valueFields[0]
            )
            : createEmptyCellMap();

    return {
        rowFields,
        columnFields,
        valueFields,
        filterFields,

        rowHeaders,
        columnHeaders,

        filters,
        cells,

        sourceRowCount:
            sourceRows.length,

        filteredRowCount:
            filteredRows.length,
    };
}

/**
 * Returns the aggregated cell for one row and column
 * intersection.
 *
 * When no Columns field is active, omit columnKey.
 */
export function getPivotCell(
    model: PivotModel,
    rowKey: string,
    columnKey: string =
        DEFAULT_COLUMN_KEY
): PivotCell | undefined {
    return model.cells
        .get(rowKey)
        ?.get(columnKey);
}

export function createValueKey(
    value: PrimitiveValue
): string {
    if (
        value === null ||
        value === undefined
    ) {
        return "null:";
    }

    if (value instanceof Date) {
        return `date:${value.toISOString()}`;
    }

    return `${typeof value}:${String(
        value
    )}`;
}

export function formatPivotValue(
    value: PrimitiveValue
): string {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "(Blank)";
    }

    if (value instanceof Date) {
        return value.toLocaleDateString(
            "en-US"
        );
    }

    if (
        typeof value === "number"
    ) {
        return value.toLocaleString(
            "en-US"
        );
    }

    if (
        typeof value === "boolean"
    ) {
        return value
            ? "True"
            : "False";
    }

    return String(value);
}

function createEmptyPivotModel():
    PivotModel {
    return {
        rowFields: [],
        columnFields: [],
        valueFields: [],
        filterFields: [],

        rowHeaders: [],
        columnHeaders: [],

        filters: [],
        cells:
            createEmptyCellMap(),

        sourceRowCount: 0,
        filteredRowCount: 0,
    };
}

function createEmptyCellMap():
    PivotCellMap {
    return new Map<
        string,
        Map<string, PivotCell>
    >();
}

function resolveFields(
    requestedFields: AnalyticsField[],
    columns: DataViewMetadataColumn[]
): PivotResolvedField[] {
    const resolvedFields:
        PivotResolvedField[] = [];

    requestedFields.forEach(
        (field) => {
            const columnIndex =
                findColumnIndex(
                    field,
                    columns
                );

            if (
                columnIndex < 0
            ) {
                return;
            }

            resolvedFields.push({
                field,

                column:
                    columns[columnIndex],

                columnIndex,
            });
        }
    );

    return resolvedFields;
}

function findColumnIndex(
    field: AnalyticsField,
    columns: DataViewMetadataColumn[]
): number {
    return columns.findIndex(
        (column) => {
            if (
                column.queryName &&
                column.queryName ===
                    field.id
            ) {
                return true;
            }

            if (
                column.displayName ===
                field.name
            ) {
                return true;
            }

            return false;
        }
    );
}

function findUnresolvedFields(
    requestedFields: AnalyticsField[],
    resolvedFields: PivotResolvedField[]
): AnalyticsField[] {
    const resolvedFieldIds =
        new Set(
            resolvedFields.map(
                ({ field }) =>
                    field.id
            )
        );

    return requestedFields.filter(
        (field) =>
            !resolvedFieldIds.has(
                field.id
            )
    );
}

function createUnavailableFieldMessage(
    fields: AnalyticsField[]
): string {
    const fieldNames =
        fields
            .map(
                (field) =>
                    field.name
            )
            .join(", ");

    return (
        `Power BI did not return data for: ` +
        `${fieldNames}.`
    );
}

function createUniqueHeaders(
    sourceRows: PrimitiveValue[][],
    fields: PivotResolvedField[]
): PivotHeader[] {
    if (
        fields.length === 0
    ) {
        return [];
    }

    const uniqueHeaders =
        new Map<
            string,
            PivotHeader
        >();

    sourceRows.forEach(
        (sourceRow) => {
            const values =
                getFieldValues(
                    sourceRow,
                    fields
                );

            const key =
                createHeaderKey(
                    values
                );

            if (
                uniqueHeaders.has(key)
            ) {
                return;
            }

            uniqueHeaders.set(
                key,
                {
                    key,
                    values,

                    label:
                        values
                            .map(
                                formatPivotValue
                            )
                            .join(" / "),
                }
            );
        }
    );

    return Array.from(
        uniqueHeaders.values()
    );
}

function getFieldValues(
    sourceRow: PrimitiveValue[],
    fields: PivotResolvedField[]
): PrimitiveValue[] {
    return fields.map(
        ({ columnIndex }) =>
            sourceRow[
                columnIndex
            ]
    );
}

function createHeaderKey(
    values: PrimitiveValue[]
): string {
    return JSON.stringify(
        values.map(
            createValueKey
        )
    );
}

function buildValueCells(
    sourceRows: PrimitiveValue[][],
    rowFields: PivotResolvedField[],
    columnFields: PivotResolvedField[],
    valueField: PivotResolvedField
): PivotCellMap {
    const cells =
        createEmptyCellMap();

    const aggregation =
        getAggregation(
            valueField
        );

    sourceRows.forEach(
        (sourceRow) => {
            const rowKey =
                createHeaderKey(
                    getFieldValues(
                        sourceRow,
                        rowFields
                    )
                );

            const columnKey =
                columnFields.length > 0
                    ? createHeaderKey(
                        getFieldValues(
                            sourceRow,
                            columnFields
                        )
                    )
                    : DEFAULT_COLUMN_KEY;

            const value =
                sourceRow[
                    valueField.columnIndex
                ];

            addValueToCell(
                cells,
                rowKey,
                columnKey,
                value,
                aggregation
            );
        }
    );

    return cells;
}

function addValueToCell(
    cells: PivotCellMap,
    rowKey: string,
    columnKey: string,
    value: PrimitiveValue,
    aggregation: PivotAggregation
): void {
    let rowCells =
        cells.get(
            rowKey
        );

    if (!rowCells) {
        rowCells =
            new Map<
                string,
                PivotCell
            >();

        cells.set(
            rowKey,
            rowCells
        );
    }

    let cell =
        rowCells.get(
            columnKey
        );

    if (!cell) {
        cell = {
            rowKey,
            columnKey,

            value: 0,
            sourceCount: 0,

            aggregation,
        };

        rowCells.set(
            columnKey,
            cell
        );
    }

    if (
        value === null ||
        value === undefined
    ) {
        return;
    }

    if (
        aggregation === "sum"
    ) {
        if (
            typeof value !== "number" ||
            !Number.isFinite(value)
        ) {
            return;
        }

        cell.value += value;
        cell.sourceCount += 1;

        return;
    }

    cell.value += 1;
    cell.sourceCount += 1;
}

function getAggregation(
    valueField: PivotResolvedField
): PivotAggregation {
    if (
        valueField.field.isMeasure ||
        valueField.field.type ===
            "number" ||
        valueField.column.type
            ?.numeric
    ) {
        return "sum";
    }

    return "count";
}

function buildFilters(
    sourceRows: PrimitiveValue[][],
    filterFields: PivotResolvedField[],
    selectedFilterValues: ReadonlyMap<
        string,
        string
    >
): PivotFilter[] {
    return filterFields.map(
        (resolvedField) => {
            const options =
                createFilterOptions(
                    sourceRows,
                    resolvedField
                );

            const selectedKey =
                selectedFilterValues.get(
                    resolvedField.field.id
                );

            const selectedKeyExists =
                selectedKey !==
                    undefined &&
                options.some(
                    (option) =>
                        option.key ===
                        selectedKey
                );

            return {
                field:
                    resolvedField.field,

                columnIndex:
                    resolvedField.columnIndex,

                options,

                selectedKey:
                    selectedKeyExists
                        ? selectedKey
                        : undefined,
            };
        }
    );
}

function createFilterOptions(
    sourceRows: PrimitiveValue[][],
    resolvedField: PivotResolvedField
): PivotFilterOption[] {
    const uniqueOptions =
        new Map<
            string,
            PivotFilterOption
        >();

    sourceRows.forEach(
        (sourceRow) => {
            const value =
                sourceRow[
                    resolvedField.columnIndex
                ];

            const key =
                createValueKey(
                    value
                );

            if (
                uniqueOptions.has(key)
            ) {
                return;
            }

            uniqueOptions.set(
                key,
                {
                    key,
                    value,

                    label:
                        formatPivotValue(
                            value
                        ),
                }
            );
        }
    );

    return Array.from(
        uniqueOptions.values()
    ).sort(
        (
            first,
            second
        ) =>
            first.label.localeCompare(
                second.label,
                undefined,
                {
                    numeric: true,
                    sensitivity: "base",
                }
            )
    );
}

function applyFilters(
    sourceRows: PrimitiveValue[][],
    filterFields: PivotResolvedField[],
    selectedFilterValues: ReadonlyMap<
        string,
        string
    >
): PrimitiveValue[][] {
    if (
        filterFields.length === 0 ||
        selectedFilterValues.size === 0
    ) {
        return sourceRows;
    }

    return sourceRows.filter(
        (sourceRow) =>
            filterFields.every(
                (resolvedField) => {
                    const selectedKey =
                        selectedFilterValues.get(
                            resolvedField.field.id
                        );

                    if (
                        selectedKey ===
                        undefined
                    ) {
                        return true;
                    }

                    const sourceValue =
                        sourceRow[
                            resolvedField.columnIndex
                        ];

                    return (
                        createValueKey(
                            sourceValue
                        ) ===
                        selectedKey
                    );
                }
            )
    );
}