import Chart from 'chart.js';
export declare class CanvasColour implements Chart.PluginServiceGlobalRegistration, Chart.PluginServiceRegistrationOptions {
    readonly id = "canvasColour";
    beforeDraw(chart: Chart, _easing: string, options: ICanvasColourPluginOptions): void;
}
export interface ICanvasColourPluginOptions {
    /**
     * True to enable the plugin for the chart.
     *
     * @type {boolean}
     * @memberof ICanvasColourPluginOptions
     */
    readonly enabled: boolean;
    /**
     * The html colour for the canvas.
     *
     * @type {(string | CanvasGradient | CanvasPattern)}
     * @memberof ICanvasColourPluginOptions
     * @see https://www.w3schools.com/colors/default.asp
     */
    readonly canvasColour: string | CanvasGradient | CanvasPattern;
    /**
     * The optional pixel width of a border on the edge of the canvas.
     *
     * @type {number}
     * @memberof ICanvasColourPluginOptions
     */
    readonly border?: number;
    /**
     * The html colour of the optional border.
     *
     * @type {(string | CanvasGradient | CanvasPattern)}
     * @memberof ICanvasColourPluginOptions
     * @see https://www.w3schools.com/colors/default.asp
     */
    readonly borderColour?: string | CanvasGradient | CanvasPattern;
    /**
     * The optional html colour for the area under the chart.
     *
     * @type {(string | CanvasGradient | CanvasPattern)}
     * @memberof ICanvasColourPluginOptions
     * @see https://www.w3schools.com/colors/default.asp
     */
    readonly chartAreaColour?: string | CanvasGradient | CanvasPattern;
}
