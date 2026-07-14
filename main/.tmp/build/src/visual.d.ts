import "./components/style.less";
import powerbi from "powerbi-visuals-api";
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
export declare class Visual implements IVisual {
    private readonly hostElement;
    private readonly root;
    private dataView?;
    private availableFields;
    constructor(options: VisualConstructorOptions);
    update(options: VisualUpdateOptions): void;
    private render;
    private renderWorkspace;
    private handleFieldSelection;
    private renderFieldWells;
    private renderWell;
    private renderPivotArea;
    private renderTableWireframe;
    private createElement;
}
