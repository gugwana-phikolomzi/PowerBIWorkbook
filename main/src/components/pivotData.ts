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

    const filterFields =
        resolveFields(
            fieldWellsState.filters,
            tableData.columns
        );

    const unresolvedRowFields =
        findUnresolvedFields(
            fieldWellsState.rows,
            rowFields
        );

    if (
        unresolvedRowFields.length > 0
    ) {
        return {
            ...emptyModel,

            rowFields,
            columnFields,
            filterFields,

            sourceRowCount:
                sourceRows.length,

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
            ...emptyModel,

            rowFields,
            columnFields,
            filterFields,

            sourceRowCount:
                sourceRows.length,

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

    const unresolvedFilterFields =
        findUnresolvedFields(
            fieldWellsState.filters,
            filterFields
        );

    if (
        unresolvedFilterFields.length > 0
    ) {
        return {
            ...emptyModel,

            rowFields,
            columnFields,
            filterFields,

            sourceRowCount:
                sourceRows.length,

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

    return {
        rowFields,
        columnFields,
        filterFields,

        rowHeaders,
        columnHeaders,

        filters,

        sourceRowCount:
            sourceRows.length,

        filteredRowCount:
            filteredRows.length,
    };
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
        filterFields: [],

        rowHeaders: [],
        columnHeaders: [],

        filters: [],

        sourceRowCount: 0,
        filteredRowCount: 0,
    };
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
                fields.map(
                    ({ columnIndex }) =>
                        sourceRow[
                            columnIndex
                        ]
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

function createHeaderKey(
    values: PrimitiveValue[]
): string {
    return JSON.stringify(
        values.map(
            createValueKey
        )
    );
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