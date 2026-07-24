import powerbi from "powerbi-visuals-api";

import DataViewMetadataColumn =
    powerbi.DataViewMetadataColumn;

export type FieldDataType =
    | "date"
    | "number"
    | "text"
    | "boolean"
    | "geography";

export interface AnalyticsField {
    id: string;
    name: string;
    type: FieldDataType;
    isMeasure: boolean;
}

export interface FieldsPanelOptions {
    fields: AnalyticsField[];
    onFieldDragStart?: (
        field: AnalyticsField,
        event: DragEvent
    ) => void;
    onFieldDragEnd?: (
        field: AnalyticsField,
        event: DragEvent
    ) => void;
}

interface FieldsHelpElements {
    container: HTMLElement;
    text: HTMLElement;
}

export function buildFieldsFromMetadata(
    columns: DataViewMetadataColumn[] = []
): AnalyticsField[] {
    return columns
        .filter((column) =>
            Boolean(column.roles?.fields)
        )
        .map((column, index) => ({
            id:
                column.queryName ??
                `${column.displayName}-${index}`,
            name: getFieldDisplayName(column),
            type: getFieldDataType(column),
            isMeasure: Boolean(column.isMeasure),
        }));
}

export function renderFieldsPanel(
    options: FieldsPanelOptions
): HTMLElement {
    const panel = createElement(
        "aside",
        "pivot-fields-panel"
    );

    // ------------------------------------------------------------------
    // Header
    // ------------------------------------------------------------------

    const header = createElement(
        "div",
        "pivot-fields-header"
    );

    const title = createElement(
        "h2",
        "pivot-fields-title",
        "Fields"
    );

    const fieldCount = createElement(
        "span",
        "pivot-fields-count"
    );

    header.append(
        title,
        fieldCount
    );

    // ------------------------------------------------------------------
    // Search
    // ------------------------------------------------------------------

    const searchInput = createSearchInput();

    // ------------------------------------------------------------------
    // Field List
    // ------------------------------------------------------------------

    const fieldList = createElement(
        "div",
        "pivot-field-list"
    );

    fieldList.setAttribute(
        "role",
        "list"
    );

    // ------------------------------------------------------------------
    // Help
    // ------------------------------------------------------------------

    const help = renderHelp();

    // ------------------------------------------------------------------
    // Count and Help Text
    // ------------------------------------------------------------------

    const updatePanelStatus = (
        visibleFieldCount = options.fields.length,
        searchText = ""
    ): void => {
        const totalFieldCount =
            options.fields.length;

        const hasSearch =
            searchText.trim().length > 0;

        fieldCount.textContent = hasSearch
            ? `${visibleFieldCount}/${totalFieldCount}`
            : totalFieldCount.toString();

        fieldCount.setAttribute(
            "aria-label",
            hasSearch
                ? `${visibleFieldCount} of ${totalFieldCount} fields shown`
                : `${totalFieldCount} ${
                    totalFieldCount === 1
                        ? "field"
                        : "fields"
                } loaded`
        );

        help.text.textContent = hasSearch
            ? "Drag a field from the search results into Rows, Columns, Values or Filters."
            : "Drag fields into Rows, Columns, Values or Filters to build your analysis.";
    };

    // ------------------------------------------------------------------
    // Render Field List
    // ------------------------------------------------------------------

    const renderFieldList = (
        searchText = ""
    ): void => {
        fieldList.replaceChildren();

        const normalizedSearch =
            searchText.trim().toLowerCase();

        const visibleFields =
            options.fields.filter(
                (field) =>
                    field.name
                        .toLowerCase()
                        .includes(normalizedSearch)
            );

        updatePanelStatus(
            visibleFields.length,
            searchText
        );

        if (visibleFields.length === 0) {
            const emptyState = createElement(
                "div",
                "pivot-fields-empty",
                options.fields.length === 0
                    ? "Add fields to the visual's Fields data role."
                    : "No matching fields found."
            );

            emptyState.setAttribute(
                "role",
                "status"
            );

            fieldList.appendChild(
                emptyState
            );

            return;
        }

        visibleFields.forEach((field) => {
            fieldList.appendChild(
                renderFieldItem(
                    field,
                    options.onFieldDragStart,
                    options.onFieldDragEnd
                )
            );
        });
    };

    // ------------------------------------------------------------------
    // Search Events
    // ------------------------------------------------------------------

    searchInput.addEventListener(
        "input",
        () => {
            renderFieldList(
                searchInput.value
            );
        }
    );

    // ------------------------------------------------------------------
    // Initial Render
    // ------------------------------------------------------------------

    renderFieldList();

    panel.append(
        header,
        searchInput,
        fieldList,
        help.container
    );

    return panel;
}

function renderFieldItem(
    field: AnalyticsField,
    onFieldDragStart?: (
        field: AnalyticsField,
        event: DragEvent
    ) => void,
    onFieldDragEnd?: (
        field: AnalyticsField,
        event: DragEvent
    ) => void
): HTMLElement {
    const fieldItem = createElement(
        "div",
        "pivot-field-item"
    );

    fieldItem.setAttribute(
        "role",
        "listitem"
    );

    fieldItem.setAttribute(
        "tabindex",
        "0"
    );

    fieldItem.setAttribute(
        "aria-label",
        `${field.name}, ${getFieldTypeDescription(field)}. Draggable field.`
    );

    fieldItem.draggable = true;

    fieldItem.dataset.fieldId =
        field.id;

    fieldItem.dataset.fieldType =
        field.isMeasure
            ? "measure"
            : field.type;

    const typeIcon = createElement(
        "span",
        "pivot-field-type",
        getFieldTypeLabel(field)
    );

    typeIcon.dataset.fieldType =
        field.isMeasure
            ? "measure"
            : field.type;

    typeIcon.setAttribute(
        "aria-hidden",
        "true"
    );

    typeIcon.title =
        getFieldTypeDescription(field);

    const fieldName = createElement(
        "span",
        "pivot-field-name",
        field.name
    );

    fieldName.title =
        field.name;

    fieldItem.addEventListener(
        "dragstart",
        (event) => {
            fieldItem.classList.add(
                "dragging"
            );

            event.dataTransfer?.setData(
                "text/plain",
                field.id
            );

            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed =
                    "move";
            }

            onFieldDragStart?.(
                field,
                event
            );
        }
    );

    fieldItem.addEventListener(
        "dragend",
        (event) => {
            fieldItem.classList.remove(
                "dragging"
            );

            onFieldDragEnd?.(
                field,
                event
            );
        }
    );

    fieldItem.append(
        typeIcon,
        fieldName
    );

    return fieldItem;
}

function createSearchInput(): HTMLInputElement {
    const searchInput =
        document.createElement("input");

    searchInput.type = "search";
    searchInput.className =
        "pivot-search";
    searchInput.placeholder =
        "Search fields";
    searchInput.autocomplete =
        "off";
    searchInput.spellcheck =
        false;

    searchInput.setAttribute(
        "aria-label",
        "Search fields"
    );

    return searchInput;
}

function renderHelp(): FieldsHelpElements {
    const help = createElement(
        "div",
        "pivot-help"
    );

    const helpIcon = createElement(
        "span",
        "pivot-help-icon",
        "i"
    );

    helpIcon.setAttribute(
        "aria-hidden",
        "true"
    );

    const helpText = createElement(
        "span",
        "pivot-help-text",
        "Drag fields into Rows, Columns, Values or Filters to build your analysis."
    );

    help.append(
        helpIcon,
        helpText
    );

    return {
        container: help,
        text: helpText,
    };
}

function getFieldDisplayName(
    column: DataViewMetadataColumn
): string {
    return column.displayName;
}

function getFieldDataType(
    column: DataViewMetadataColumn
): FieldDataType {
    if (column.type?.dateTime) {
        return "date";
    }

    if (
        column.type?.integer ||
        column.type?.numeric
    ) {
        return "number";
    }

    if (column.type?.bool) {
        return "boolean";
    }

    if (
        column.type?.geography?.city ||
        column.type?.geography?.continent ||
        column.type?.geography?.country ||
        column.type?.geography?.county ||
        column.type?.geography?.latitude ||
        column.type?.geography?.longitude ||
        column.type?.geography?.place ||
        column.type?.geography?.postalCode ||
        column.type?.geography?.region ||
        column.type?.geography?.stateOrProvince
    ) {
        return "geography";
    }

    return "text";
}

function getFieldTypeLabel(
    field: AnalyticsField
): string {
    if (field.isMeasure) {
        return "SUM";
    }

    switch (field.type) {
        case "date":
            return "DATE";

        case "number":
            return "1.2";

        case "boolean":
            return "T/F";

        case "geography":
            return "GEO";

        case "text":
        default:
            return "ABC";
    }
}

function getFieldTypeDescription(
    field: AnalyticsField
): string {
    if (field.isMeasure) {
        return "Measure";
    }

    switch (field.type) {
        case "date":
            return "Date field";

        case "number":
            return "Number field";

        case "boolean":
            return "Boolean field";

        case "geography":
            return "Geography field";

        case "text":
        default:
            return "Text field";
    }
}

function createElement<
    K extends keyof HTMLElementTagNameMap
>(
    tagName: K,
    className = "",
    text?: string
): HTMLElementTagNameMap[K] {
    const element =
        document.createElement(tagName);

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