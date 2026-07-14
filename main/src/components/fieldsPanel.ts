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
    selected: boolean;
}

export interface FieldsPanelOptions {
    fields: AnalyticsField[];
    onFieldSelectionChange?: (
        field: AnalyticsField,
        selected: boolean
    ) => void;
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
            selected: false,
        }));
}

export function renderFieldsPanel(
    options: FieldsPanelOptions
): HTMLElement {
    const panel = createElement(
        "aside",
        "pivot-fields-panel"
    );

    const title = createElement(
        "h2",
        "pivot-fields-title",
        "Fields"
    );

    const searchInput = createSearchInput();

    const fieldList = createElement(
        "div",
        "pivot-field-list"
    );

    const renderFieldList = (
        searchText = ""
    ): void => {
        fieldList.replaceChildren();

        const normalizedSearch =
            searchText.trim().toLowerCase();

        const visibleFields = options.fields.filter(
            (field) =>
                field.name
                    .toLowerCase()
                    .includes(normalizedSearch)
        );

        if (visibleFields.length === 0) {
            fieldList.appendChild(
                createElement(
                    "div",
                    "pivot-fields-empty",
                    options.fields.length === 0
                        ? "Add fields to the visual's Fields data role."
                        : "No matching fields found."
                )
            );

            return;
        }

        visibleFields.forEach((field) => {
            fieldList.appendChild(
                renderFieldItem(
                    field,
                    options.onFieldSelectionChange
                )
            );
        });
    };

    searchInput.addEventListener(
        "input",
        () => {
            renderFieldList(searchInput.value);
        }
    );

    renderFieldList();

    panel.append(
        title,
        searchInput,
        fieldList,
        renderHelp()
    );

    return panel;
}

function renderFieldItem(
    field: AnalyticsField,
    onFieldSelectionChange?: (
        field: AnalyticsField,
        selected: boolean
    ) => void
): HTMLElement {
    const label = createElement(
        "label",
        "pivot-field-item"
    );

    const checkbox =
        document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.className =
        "pivot-field-checkbox-input";

    checkbox.checked = field.selected;

    checkbox.setAttribute(
        "aria-label",
        `Select ${field.name}`
    );

    const checkboxDisplay = createElement(
        "span",
        field.selected
            ? "pivot-checkbox selected"
            : "pivot-checkbox"
    );

    checkboxDisplay.textContent =
        field.selected ? "✓" : "";

    const typeIcon = createElement(
        "span",
        "pivot-field-type",
        getFieldTypeLabel(field)
    );

typeIcon.dataset.fieldType =
    field.isMeasure
        ? "measure"
        : field.type;

    const fieldName = createElement(
        "span",
        "pivot-field-name",
        field.name
    );

    checkbox.addEventListener(
        "change",
        () => {
            field.selected = checkbox.checked;

            checkboxDisplay.classList.toggle(
                "selected",
                checkbox.checked
            );

            checkboxDisplay.textContent =
                checkbox.checked ? "✓" : "";

            onFieldSelectionChange?.(
                field,
                checkbox.checked
            );
        }
    );

    label.append(
        checkbox,
        checkboxDisplay,
        typeIcon,
        fieldName
    );

    return label;
}

function createSearchInput(): HTMLInputElement {
    const searchInput =
        document.createElement("input");

    searchInput.type = "search";
    searchInput.className = "pivot-search";
    searchInput.placeholder = "Search fields";

    searchInput.setAttribute(
        "aria-label",
        "Search fields"
    );

    return searchInput;
}

function renderHelp(): HTMLElement {
    const help = createElement(
        "div",
        "pivot-help"
    );

    help.append(
        createElement(
            "span",
            "pivot-help-icon",
            "i"
        ),
        createElement(
            "span",
            "pivot-help-text",
            "Select fields to Rows, Columns, Values or Filters to build your own analysis."
        )
    );

    return help;
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
        return "Σ";
    }

    switch (field.type) {
        case "date":
            return "▣";

        case "number":
            return "1.2";

        case "boolean":
            return "T/F";

        case "geography":
            return "◎";

        case "text":
        default:
            return "ABC";
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
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}