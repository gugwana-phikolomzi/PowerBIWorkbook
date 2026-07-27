"use strict";

import powerbi from "powerbi-visuals-api";

import {
    FieldWellsState,
} from "./fieldWells";

import {
    buildPivotModel,
    PivotFilter,
    PivotHeader,
    PivotModel,
} from "./pivotData";

import DataView =
    powerbi.DataView;

export interface PivotTableOptions {
    dataView?: DataView;
    fieldWellsState: FieldWellsState;
}

interface ColumnHeaderGroup {
    key: string;
    label: string;
    span: number;
}

const MAX_RENDERED_ROWS = 500;
const MAX_RENDERED_COLUMNS = 100;

const ALL_FILTER_VALUES =
    "__pivot_all_values__";

/**
 * Stores the active filter selection for each
 * field placed in the Filters well.
 */
const selectedFilterValues =
    new Map<string, string>();

export function renderPivotTable(
    options: PivotTableOptions
): HTMLElement {
    const root = createElement(
        "div",
        "pivot-table-container"
    );

    renderPivotTableContent(
        root,
        options
    );

    return root;
}

function renderPivotTableContent(
    root: HTMLElement,
    options: PivotTableOptions
): void {
    root.replaceChildren();

    removeInactiveFilterSelections(
        options.fieldWellsState
    );

    const model =
        buildPivotModel({
            dataView:
                options.dataView,

            fieldWellsState:
                options.fieldWellsState,

            selectedFilterValues,
        });

    if (model.error) {
        root.appendChild(
            renderEmptyState(
                model.error.title,
                model.error.description
            )
        );

        return;
    }

    if (model.filters.length > 0) {
        root.appendChild(
            renderFilterControls(
                model.filters,
                () => {
                    renderPivotTableContent(
                        root,
                        options
                    );
                }
            )
        );
    }

    if (model.rowFields.length === 0) {
        root.appendChild(
            renderEmptyState(
                "Add a row field",
                "Drag a field into Rows."
            )
        );

        return;
    }

    if (model.filteredRowCount === 0) {
        root.appendChild(
            renderEmptyState(
                "No matching rows",
                "No data matches the selected filters."
            )
        );

        return;
    }

    if (model.rowHeaders.length === 0) {
        root.appendChild(
            renderEmptyState(
                "No row values",
                "The selected row fields contain no values."
            )
        );

        return;
    }

    root.appendChild(
        renderTable(model)
    );

    appendLimitMessages(
        root,
        model
    );
}

function renderTable(
    model: PivotModel
): HTMLElement {
    const table = createElement(
        "div",
        "pivot-table"
    );

    const visibleRows =
        model.rowHeaders.slice(
            0,
            MAX_RENDERED_ROWS
        );

    const visibleColumns =
        model.columnHeaders.slice(
            0,
            MAX_RENDERED_COLUMNS
        );

    if (visibleColumns.length === 0) {
        table.appendChild(
            renderRowsOnlyHeader(
                model
            )
        );

        visibleRows.forEach(
            (rowHeader) => {
                table.appendChild(
                    renderRowsOnlyDataRow(
                        rowHeader,
                        model.rowFields.length
                    )
                );
            }
        );

        return table;
    }

    renderPivotHeaders(
        model,
        visibleColumns
    ).forEach(
        (headerRow) => {
            table.appendChild(
                headerRow
            );
        }
    );

    visibleRows.forEach(
        (rowHeader) => {
            table.appendChild(
                renderPivotDataRow(
                    rowHeader,
                    model.rowFields.length,
                    visibleColumns
                )
            );
        }
    );

    return table;
}

function renderRowsOnlyHeader(
    model: PivotModel
): HTMLElement {
    const header = createElement(
        "div",
        "pivot-table-row pivot-table-header-row"
    );

    applyGridColumns(
        header,
        model.rowFields.length
    );

    model.rowFields.forEach(
        ({ field }) => {
            header.appendChild(
                createElement(
                    "div",
                    "pivot-cell pivot-row-header pivot-header-cell",
                    field.name
                )
            );
        }
    );

    return header;
}

function renderRowsOnlyDataRow(
    rowHeader: PivotHeader,
    rowFieldCount: number
): HTMLElement {
    const row = createElement(
        "div",
        "pivot-table-row"
    );

    applyGridColumns(
        row,
        rowFieldCount
    );

    rowHeader.values.forEach(
        (value) => {
            row.appendChild(
                createElement(
                    "div",
                    "pivot-cell pivot-row-header",
                    formatDisplayValue(value)
                )
            );
        }
    );

    return row;
}

function renderPivotHeaders(
    model: PivotModel,
    columnHeaders: PivotHeader[]
): HTMLElement[] {
    const headerRows:
        HTMLElement[] = [];

    model.columnFields.forEach(
        (_columnField, levelIndex) => {
            headerRows.push(
                renderColumnHeaderLevel(
                    model,
                    columnHeaders,
                    levelIndex
                )
            );
        }
    );

    return headerRows;
}

function renderColumnHeaderLevel(
    model: PivotModel,
    columnHeaders: PivotHeader[],
    levelIndex: number
): HTMLElement {
    const header = createElement(
        "div",
        "pivot-table-row pivot-table-header-row"
    );

    applyPivotGridColumns(
        header,
        model.rowFields.length,
        columnHeaders.length
    );

    const isFinalColumnLevel =
        levelIndex ===
        model.columnFields.length - 1;

    if (isFinalColumnLevel) {
        model.rowFields.forEach(
            ({ field }) => {
                header.appendChild(
                    createElement(
                        "div",
                        "pivot-cell pivot-row-header pivot-header-cell",
                        field.name
                    )
                );
            }
        );
    } else {
        const cornerCell =
            createElement(
                "div",
                "pivot-cell pivot-row-header pivot-header-cell pivot-corner-cell",
                ""
            );

        cornerCell.style.gridColumn =
            `span ${Math.max(
                1,
                model.rowFields.length
            )}`;

        header.appendChild(
            cornerCell
        );
    }

    const groups =
        createColumnHeaderGroups(
            columnHeaders,
            levelIndex
        );

    groups.forEach(
        (group) => {
            const cell =
                createElement(
                    "div",
                    "pivot-cell pivot-column-header pivot-header-cell",
                    group.label
                );

            cell.style.gridColumn =
                `span ${group.span}`;

            header.appendChild(
                cell
            );
        }
    );

    const columnField =
        model.columnFields[
            levelIndex
        ];

    header.setAttribute(
        "aria-label",
        `Column field: ${columnField.field.name}`
    );

    return header;
}

function renderPivotDataRow(
    rowHeader: PivotHeader,
    rowFieldCount: number,
    columnHeaders: PivotHeader[]
): HTMLElement {
    const row = createElement(
        "div",
        "pivot-table-row"
    );

    applyPivotGridColumns(
        row,
        rowFieldCount,
        columnHeaders.length
    );

    rowHeader.values.forEach(
        (value) => {
            row.appendChild(
                createElement(
                    "div",
                    "pivot-cell pivot-row-header",
                    formatDisplayValue(value)
                )
            );
        }
    );

    columnHeaders.forEach(
        () => {
            row.appendChild(
                createElement(
                    "div",
                    "pivot-cell pivot-data-cell",
                    ""
                )
            );
        }
    );

    return row;
}

function createColumnHeaderGroups(
    columnHeaders: PivotHeader[],
    levelIndex: number
): ColumnHeaderGroup[] {
    const groups:
        ColumnHeaderGroup[] = [];

    columnHeaders.forEach(
        (columnHeader) => {
            const key =
                createColumnLevelKey(
                    columnHeader,
                    levelIndex
                );

            const label =
                formatDisplayValue(
                    columnHeader.values[
                        levelIndex
                    ]
                );

            const previousGroup =
                groups[
                    groups.length - 1
                ];

            if (
                previousGroup &&
                previousGroup.key === key
            ) {
                previousGroup.span += 1;

                return;
            }

            groups.push({
                key,
                label,
                span: 1,
            });
        }
    );

    return groups;
}

function createColumnLevelKey(
    columnHeader: PivotHeader,
    levelIndex: number
): string {
    const hierarchyValues =
        columnHeader.values.slice(
            0,
            levelIndex + 1
        );

    return JSON.stringify(
        hierarchyValues.map(
            normalizeHeaderValue
        )
    );
}

function normalizeHeaderValue(
    value: powerbi.PrimitiveValue
): string | number | boolean | null {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (value instanceof Date) {
        return value.toISOString();
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return value;
    }

    return String(value);
}

function renderFilterControls(
    filters: PivotFilter[],
    onFilterChange: () => void
): HTMLElement {
    const filterBar = createElement(
        "div",
        "pivot-table-filters"
    );

    filters.forEach(
        (filter) => {
            filterBar.appendChild(
                renderFilterControl(
                    filter,
                    onFilterChange
                )
            );
        }
    );

    return filterBar;
}

function renderFilterControl(
    filter: PivotFilter,
    onFilterChange: () => void
): HTMLElement {
    const wrapper = createElement(
        "label",
        "pivot-table-filter"
    );

    const label = createElement(
        "span",
        "pivot-table-filter-label",
        filter.field.name
    );

    const select = createElement(
        "select",
        "pivot-table-filter-select"
    );

    const allOption =
        document.createElement(
            "option"
        );

    allOption.value =
        ALL_FILTER_VALUES;

    allOption.textContent =
        "(All)";

    select.appendChild(
        allOption
    );

    filter.options.forEach(
        (filterOption) => {
            const option =
                document.createElement(
                    "option"
                );

            option.value =
                filterOption.key;

            option.textContent =
                filterOption.label;

            select.appendChild(
                option
            );
        }
    );

    select.value =
        filter.selectedKey ??
        ALL_FILTER_VALUES;

    select.addEventListener(
        "change",
        () => {
            if (
                select.value ===
                ALL_FILTER_VALUES
            ) {
                selectedFilterValues.delete(
                    filter.field.id
                );
            } else {
                selectedFilterValues.set(
                    filter.field.id,
                    select.value
                );
            }

            onFilterChange();
        }
    );

    wrapper.append(
        label,
        select
    );

    return wrapper;
}

function removeInactiveFilterSelections(
    fieldWellsState: FieldWellsState
): void {
    const activeFilterIds =
        new Set(
            fieldWellsState.filters.map(
                (field) =>
                    field.id
            )
        );

    Array.from(
        selectedFilterValues.keys()
    ).forEach(
        (fieldId) => {
            if (
                !activeFilterIds.has(
                    fieldId
                )
            ) {
                selectedFilterValues.delete(
                    fieldId
                );
            }
        }
    );
}

function appendLimitMessages(
    root: HTMLElement,
    model: PivotModel
): void {
    if (
        model.rowHeaders.length >
        MAX_RENDERED_ROWS
    ) {
        root.appendChild(
            createElement(
                "div",
                "pivot-table-limit-message",
                `Showing the first ${MAX_RENDERED_ROWS.toLocaleString(
                    "en-US"
                )} of ${model.rowHeaders.length.toLocaleString(
                    "en-US"
                )} rows.`
            )
        );
    }

    if (
        model.columnHeaders.length >
        MAX_RENDERED_COLUMNS
    ) {
        root.appendChild(
            createElement(
                "div",
                "pivot-table-limit-message",
                `Showing the first ${MAX_RENDERED_COLUMNS.toLocaleString(
                    "en-US"
                )} of ${model.columnHeaders.length.toLocaleString(
                    "en-US"
                )} columns.`
            )
        );
    }
}

/**
 * Applies separate grid sections for:
 *
 * 1. Fields assigned to Rows.
 * 2. Unique combinations generated from Columns.
 */
function applyPivotGridColumns(
    row: HTMLElement,
    rowFieldCount: number,
    columnCount: number
): void {
    const rowColumns =
        `repeat(${Math.max(
            1,
            rowFieldCount
        )}, minmax(160px, 1fr))`;

    const pivotColumns =
        columnCount > 0
            ? ` repeat(${columnCount}, minmax(110px, 1fr))`
            : "";

    row.style.gridTemplateColumns =
        `${rowColumns}${pivotColumns}`;
}

function applyGridColumns(
    row: HTMLElement,
    columnCount: number
): void {
    row.style.gridTemplateColumns =
        `repeat(${Math.max(
            1,
            columnCount
        )}, minmax(180px, 1fr))`;
}

function formatDisplayValue(
    value: powerbi.PrimitiveValue
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

    if (typeof value === "number") {
        return value.toLocaleString(
            "en-US"
        );
    }

    if (typeof value === "boolean") {
        return value
            ? "True"
            : "False";
    }

    return String(value);
}

function renderEmptyState(
    title: string,
    description: string
): HTMLElement {
    const emptyState = createElement(
        "div",
        "pivot-table-empty"
    );

    const icon = createElement(
        "div",
        "pivot-table-empty-icon",
        "▦"
    );

    icon.setAttribute(
        "aria-hidden",
        "true"
    );

    const content = createElement(
        "div",
        "pivot-table-empty-content"
    );

    content.append(
        createElement(
            "div",
            "pivot-table-empty-title",
            title
        ),

        createElement(
            "div",
            "pivot-table-empty-description",
            description
        )
    );

    emptyState.append(
        icon,
        content
    );

    return emptyState;
}

function createElement<
    K extends keyof HTMLElementTagNameMap
>(
    tagName: K,
    className = "",
    text?: string
): HTMLElementTagNameMap[K] {
    const element =
        document.createElement(
            tagName
        );

    if (className) {
        element.className =
            className;
    }

    if (text !== undefined) {
        element.textContent =
            text;
    }

    return element;
}