import powerbi from "powerbi-visuals-api";
import { FieldWellsState } from "./fieldWells";
import DataView = powerbi.DataView;
export interface PivotTableOptions {
    dataView?: DataView;
    fieldWellsState: FieldWellsState;
}
export declare function renderPivotTable(options: PivotTableOptions): HTMLElement;
