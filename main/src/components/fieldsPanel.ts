// type FieldType =
//     | "date"
//     | "text"
//     | "number"
//     | "geography";

// interface FieldDefinition {
//     name: string;
//     type: FieldType;
//     selected: boolean;
// }

// interface FieldGroupDefinition {
//     icon: string;
//     title: string;
//     fields: FieldDefinition[];
// }

// const fieldGroups: FieldGroupDefinition[] = [
//     {
//         icon: "▦",
//         title: "Sales",
//         fields: [
//             {
//                 name: "Calendar Year",
//                 type: "date",
//                 selected: true,
//             },
//             {
//                 name: "Calendar Quarter",
//                 type: "date",
//                 selected: false,
//             },
//             {
//                 name: "Calendar Month",
//                 type: "date",
//                 selected: false,
//             },
//         ],
//     },
//     {
//         icon: "◇",
//         title: "Products",
//         fields: [
//             {
//                 name: "Product Category",
//                 type: "text",
//                 selected: true,
//             },
//             {
//                 name: "Product Subcategory",
//                 type: "text",
//                 selected: false,
//             },
//             {
//                 name: "Product",
//                 type: "text",
//                 selected: false,
//             },
//         ],
//     },
//     {
//         icon: "Σ",
//         title: "Measures",
//         fields: [
//             {
//                 name: "Sales Amount",
//                 type: "number",
//                 selected: true,
//             },
//             {
//                 name: "Order Quantity",
//                 type: "number",
//                 selected: false,
//             },
//             {
//                 name: "Discount Amount",
//                 type: "number",
//                 selected: false,
//             },
//             {
//                 name: "Customer Count",
//                 type: "number",
//                 selected: false,
//             },
//         ],
//     },
//     {
//         icon: "◎",
//         title: "Geography",
//         fields: [
//             {
//                 name: "Region",
//                 type: "geography",
//                 selected: false,
//             },
//             {
//                 name: "Country",
//                 type: "geography",
//                 selected: false,
//             },
//         ],
//     },
// ];

// export function renderFieldsPanel(): HTMLElement {
//     const panel = createElement(
//         "aside",
//         "pivot-fields-panel"
//     );

//     const title = createElement(
//         "h2",
//         "pivot-fields-title",
//         "Fields"
//     );

//     const search = renderSearch();

//     const fieldList = createElement(
//         "div",
//         "pivot-field-list"
//     );

//     fieldGroups.forEach((group) => {
//         fieldList.appendChild(
//             renderFieldGroup(group)
//         );
//     });

//     const help = renderHelp();

//     panel.append(
//         title,
//         search,
//         fieldList,
//         help
//     );

//     return panel;
// }

// function renderSearch(): HTMLElement {
//     const search = createElement(
//         "div",
//         "pivot-search"
//     );

//     search.append(
//         createElement(
//             "span",
//             "pivot-search-icon",
//             "⌕"
//         ),
//         createElement(
//             "span",
//             "pivot-search-placeholder",
//             "Search fields"
//         )
//     );

//     return search;
// }

// function renderFieldGroup(
//     groupDefinition: FieldGroupDefinition
// ): HTMLElement {
//     const group = createElement(
//         "section",
//         "pivot-field-group"
//     );

//     const header = createElement(
//         "div",
//         "pivot-field-group-header"
//     );

//     const heading = createElement(
//         "div",
//         "pivot-field-group-heading"
//     );

//     heading.append(
//         createElement(
//             "span",
//             "pivot-field-group-icon",
//             groupDefinition.icon
//         ),
//         createElement(
//             "span",
//             "pivot-field-group-title",
//             groupDefinition.title
//         )
//     );

//     header.append(
//         heading,
//         createElement(
//             "span",
//             "pivot-field-group-chevron",
//             "⌄"
//         )
//     );

//     const body = createElement(
//         "div",
//         "pivot-field-group-body"
//     );

//     groupDefinition.fields.forEach((field) => {
//         body.appendChild(
//             renderFieldItem(field)
//         );
//     });

//     group.append(
//         header,
//         body
//     );

//     return group;
// }

// function renderFieldItem(
//     field: FieldDefinition
// ): HTMLElement {
//     const item = createElement(
//         "div",
//         "pivot-field-item"
//     );

//     const checkbox = createElement(
//         "span",
//         field.selected
//             ? "pivot-checkbox selected"
//             : "pivot-checkbox"
//     );

//     if (field.selected) {
//         checkbox.textContent = "✓";
//     }

//     item.append(
//         checkbox,
//         createElement(
//             "span",
//             "pivot-field-type",
//             getFieldTypeIcon(field.type)
//         ),
//         createElement(
//             "span",
//             "pivot-field-name",
//             field.name
//         )
//     );

//     return item;
// }

// function getFieldTypeIcon(
//     type: FieldType
// ): string {
//     switch (type) {
//         case "date":
//             return "▣";

//         case "number":
//             return "1.2";

//         case "geography":
//             return "◎";

//         case "text":
//         default:
//             return "ABC";
//     }
// }

// function renderHelp(): HTMLElement {
//     const help = createElement(
//         "div",
//         "pivot-help"
//     );

//     help.append(
//         createElement(
//             "span",
//             "pivot-help-icon",
//             "ⓘ"
//         ),
//         createElement(
//             "span",
//             "pivot-help-text",
//             "Drag fields to Rows, Columns or Values to build your analysis."
//         )
//     );

//     return help;
// }

// function createElement<
//     K extends keyof HTMLElementTagNameMap
// >(
//     tagName: K,
//     className = "",
//     text?: string
// ): HTMLElementTagNameMap[K] {
//     const element =
//         document.createElement(tagName);

//     if (className) {
//         element.className = className;
//     }

//     if (text !== undefined) {
//         element.textContent = text;
//     }

//     return element;
// }


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
    onFieldSelectionChange?: (
        field: AnalyticsField,
        selected: boolean
    ) => void;
}

export function buildFieldsFromMetadata(
    columns: DataViewMetadataColumn[] = []
): AnalyticsField[] {
    return columns
        .filter(column => Boolean(column.roles?.fields))
        .map((column, index) => ({
            id:
                column.queryName ??
                `${column.displayName}-${index}`,
            name: column.displayName,
            groupName: getFieldGroupName(column),
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

    const emptyState = createElement(
        "div",
        "pivot-fields-empty",
        "Add fields to the visual's Fields data role."
    );

    const renderFieldList = (
        searchText = ""
    ): void => {
        fieldList.replaceChildren();

        const normalizedSearch =
            searchText.trim().toLowerCase();

        const visibleFields = options.fields.filter(
            field =>
                field.name
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                field.groupName
                    .toLowerCase()
                    .includes(normalizedSearch)
        );

        if (visibleFields.length === 0) {
            fieldList.appendChild(emptyState);
            return;
        }

        const groups = createFieldGroups(
            visibleFields
        );

        groups.forEach(group => {
            fieldList.appendChild(
                renderFieldGroup(
                    group,
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

function createFieldGroups(
    fields: AnalyticsField[]
): FieldGroup[] {
    const groupedFields =
        new Map<string, AnalyticsField[]>();

    fields.forEach(field => {
        const groupName = field.isMeasure
            ? "Measures"
            : field.groupName;

        const existingFields =
            groupedFields.get(groupName) ?? [];

        existingFields.push(field);

        groupedFields.set(
            groupName,
            existingFields
        );
    });

    return Array.from(
        groupedFields.entries()
    ).map(([name, groupFields]) => ({
        name,
        icon: getGroupIcon(
            name,
            groupFields
        ),
        fields: groupFields,
    }));
}

function renderFieldGroup(
    groupDefinition: FieldGroup,
    onFieldSelectionChange?: (
        field: AnalyticsField,
        selected: boolean
    ) => void
): HTMLElement {
    const group = createElement(
        "section",
        "pivot-field-group"
    );

    const header = createElement(
        "button",
        "pivot-field-group-header"
    );

    header.type = "button";
    header.setAttribute(
        "aria-expanded",
        "true"
    );

    const heading = createElement(
        "span",
        "pivot-field-group-heading"
    );

    heading.append(
        createElement(
            "span",
            "pivot-field-group-icon",
            groupDefinition.icon
        ),
        createElement(
            "span",
            "pivot-field-group-title",
            groupDefinition.name
        )
    );

    const chevron = createElement(
        "span",
        "pivot-field-group-chevron",
        "⌄"
    );

    header.append(
        heading,
        chevron
    );

    const body = createElement(
        "div",
        "pivot-field-group-body"
    );

    groupDefinition.fields.forEach(field => {
        body.appendChild(
            renderFieldItem(
                field,
                onFieldSelectionChange
            )
        );
    });

    header.addEventListener(
        "click",
        () => {
            const isCollapsed =
                body.hidden;

            body.hidden = !isCollapsed;

            header.setAttribute(
                "aria-expanded",
                String(isCollapsed)
            );

            chevron.textContent =
                isCollapsed ? "⌄" : "›";
        }
    );

    group.append(
        header,
        body
    );

    return group;
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
        createElement(
            "span",
            "pivot-field-type",
            getFieldTypeLabel(field)
        ),
        createElement(
            "span",
            "pivot-field-name",
            field.name
        )
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
            "ⓘ"
        ),
        createElement(
            "span",
            "pivot-help-text",
            "Select or drag fields to build your own analysis."
        )
    );

    return help;
}

function getFieldGroupName(
    column: DataViewMetadataColumn
): string {
    if (column.isMeasure) {
        return "Measures";
    }

    const queryName = column.queryName;

    if (!queryName) {
        return "Data";
    }

    const lastSeparator =
        queryName.lastIndexOf(".");

    if (lastSeparator <= 0) {
        return "Data";
    }

    return queryName
        .slice(0, lastSeparator)
        .replace(/^'|'$/g, "")
        .trim();
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

function getGroupIcon(
    name: string,
    fields: AnalyticsField[]
): string {
    if (name === "Measures") {
        return "Σ";
    }

    if (
        fields.some(
            field =>
                field.type === "geography"
        )
    ) {
        return "◎";
    }

    return "▦";
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