import Chart from 'chart.js';

export class CanvasColour implements Chart.PluginServiceGlobalRegistration, Chart.PluginServiceRegistrationOptions {

	public readonly id = 'canvasColour';

	public beforeDraw(chart: Chart, _easing: string, options: ICanvasColourPluginOptions): void {

		if (!options.enabled) {
			return;
		}
		if (!chart.canvas) {
			throw new Error('Canvas is invalid');
		}
		if (!chart.chartArea) {
			throw new Error('ChartArea is invalid');
		}
		// https://stackoverflow.com/questions/38493564/chart-area-background-color-chartjs
		const { canvas, chartArea, ctx } = chart;
		if (!ctx) {
			throw new Error('Context is invalid');
		}
		ctx.save();
		if (options.canvasColour) {
			ctx.fillStyle = options.canvasColour;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
		if (options.borderColour && options.border) {
			ctx.lineWidth = options.border;
			ctx.strokeStyle = options.borderColour;
			ctx.strokeRect(0, 0, canvas.width, canvas.height);
		}
		if (options.chartAreaColour) {
			ctx.fillStyle = options.chartAreaColour;
			ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
		}
		ctx.restore();
	}
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
