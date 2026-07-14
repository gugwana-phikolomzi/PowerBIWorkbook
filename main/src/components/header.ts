export function renderHeader(): HTMLElement {
    const header = createElement(
        "header",
        "pivot-header"
    );

    const left = createElement(
        "div",
        "pivot-header-left"
    );

    const icon = createElement(
        "div",
        "pivot-logo",
        "▦"
    );

    icon.setAttribute(
        "aria-hidden",
        "true"
    );

    const textArea = createElement(
        "div",
        "pivot-header-copy"
    );

    const title = createElement(
        "h1",
        "pivot-title",
        "Analytics Studio"
    );

    const subtitle = createElement(
        "p",
        "pivot-subtitle",
        "Explore your data, build your own analysis, and uncover the insights that matter to you."
    );

    textArea.append(
        title,
        subtitle
    );

    left.append(
        icon,
        textArea
    );

    header.appendChild(left);

    return header;
}


function createElement<
    K extends keyof HTMLElementTagNameMap
>(
    tagName: K,
    className = "",
    text?: string
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}