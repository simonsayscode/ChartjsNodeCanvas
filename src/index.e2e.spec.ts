import { strict as assert } from 'assert';
import { writeFile, readFile } from 'fs';
import { promisify } from 'util';
import { parse, format, basename } from 'path';
import { describe, it } from 'mocha';
import { ChartConfiguration } from 'chart.js';
import memwatch from 'node-memwatch';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { freshRequire } from './freshRequire';

import { CanvasRenderService, ChartCallback, ChartJsFactory } from './';
import { CanvasColour } from './canvasColourPlugin';

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const isLocal = process.env.NODE_ENV === 'development';

describe(CanvasRenderService.name, () => {

	memwatch.on('leak', (info) => {
		throw new Error(info.reason);
	});

	console.log(`Running integration tests in ${isLocal ? 'local' : 'CI'} mode.`)

	const colours = {
		black: 'rgb(0, 0, 0)',
		white: 'rgb(255, 255, 255)',
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};
	const canvasColourOptions = {
		enabled: true,
		canvasColour: '#F5F5F5',
		borderColour: '#A9A9A9',
		border: 4,
	};
	const defaultConfiguration: ChartConfiguration = {
		type: 'bar',
		data: {
			labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
			datasets: [
				{
					label: '# of Votes',
					data: [12, 19, 3, 5, 2, 3],
					backgroundColor: [
						colours.red,
						colours.orange,
						colours.yellow,
						colours.green,
						colours.purple,
						colours.orange,
					],
				}
			]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: (value: number) => '$' + value
					} as any
				}]
			},
			plugins: {
				annotation: {
				},
				canvasColour: canvasColourOptions,
			}
		},
	};
	const width = 600;
	const height = 600;

	function createSUT(chartCallback?: ChartCallback, chartJsFactory?: ChartJsFactory): CanvasRenderService {

		return new CanvasRenderService(width, height, chartCallback, undefined, chartJsFactory);
	}

	async function assertImage(actualData: Buffer, expectedPath: string): Promise<void> {

		const expectedData = await readFileAsync(expectedPath);
		const expected = await new Promise<PNG>((resolve, reject) => {
			return new PNG({ width, height })
				.parse(expectedData, (error, png) => !!error ? reject(error) : resolve(png));
		});
		const actual = await new Promise<PNG>((resolve, reject) => {
			return new PNG({ width, height })
				.parse(actualData, (error, png) => !!error ? reject(error) : resolve(png));
		});
		const diff = new PNG({ width, height });
		// tslint:disable-next-line: no-let
		let numDiffPixels = null;
		// tslint:disable-next-line: no-let
		let actualPath = null;
		try {
			numDiffPixels = pixelmatch(actual.data, expected.data, diff.data, width, height, { threshold: 0.1 });
		} finally {
			if (isLocal) {
				actualPath = renameFile(expectedPath, (baseName) => `${baseName}-actual`);
				actual.pack();
				expected.pack();
				await writeFileAsync(renameFile(expectedPath, (baseName) => `${baseName}-expected`), expected.data);
				await writeFileAsync(actualPath, actual.data);
			}
		}
		// tslint:disable-next-line: no-let
		let diffPath = null;
		if (isLocal) {
			diffPath = renameFile(expectedPath, (baseName) => `${baseName}-diff`);
			diff.pack();
			await writeFileAsync(diffPath, diff.data);
		}
		const baseMessage = `Expected chart to match '${expectedPath}', pixel count diff: ${numDiffPixels}`;
		const message = isLocal
			? baseMessage + `, see diff at '${diffPath}', and actual at ${actualPath}`
			: baseMessage;
		assert.ok(numDiffPixels === 0, message);
	}

	it('works with registering plugin', async () => {

		const canvasRenderService = createSUT((chartJS) => {
			// (global as any).Chart = ChartJS;
			chartJS.plugins.register(freshRequire('chartjs-plugin-annotation'));
			// delete (global as any).Chart;
			chartJS.pluginService.register(new CanvasColour());
		});
		const configuration: ChartConfiguration = {
			type: 'bar',
			data: {
				labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
				datasets: [
					{
						type: 'line',
						label: 'Dataset 1',
						backgroundColor: colours.blue,
						fill: false,
						data: [-39, 44, -22, -45, -27, 12, 18]
					},
					{
						type: 'bar',
						label: 'Dataset 2',
						backgroundColor: colours.red,
						data: [-18, -43, 36, -37, 1, -1, 26],
					},
					{
						type: 'bar',
						label: 'Dataset 3',
						backgroundColor: colours.green,
						data: [-7, 21, 1, 7, 34, -29, -36]
					}
				]
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: 'Chart.js Combo Bar Line Chart'
				},
				tooltips: {
					mode: 'index',
					intersect: true
				},
				annotation: {
					annotations: [
						{
							drawTime: 'afterDatasetsDraw',
							id: 'hline',
							type: 'line',
							mode: 'horizontal',
							scaleID: 'y-axis-0',
							value: 48,
							borderColor: 'black',
							borderWidth: 5,
							label: {
								backgroundColor: 'red',
								content: 'Test Label',
								enabled: true
							}
						},
						{
							drawTime: 'beforeDatasetsDraw',
							type: 'box',
							xScaleID: 'x-axis-0',
							yScaleID: 'y-axis-0',
							xMin: 'February',
							xMax: 'April',
							yMin: -23,
							yMax: 40,
							backgroundColor: 'rgba(101, 33, 171, 0.5)',
							borderColor: 'rgb(101, 33, 171)',
							borderWidth: 1,
						}
					],
				},
				plugins: {
					canvasColour: canvasColourOptions,
				},
			} as any,
		};
		const image = await canvasRenderService.renderToBuffer(configuration);
		await assertImage(image, './testData/chartjs-plugin-annotation.png');
		// const actual = hashCode(image.toString('base64'));
		// const expected = -1742834127;
		// assert.equal(actual, expected);
	});

	it('works with self registering plugin', async () => {

		const chartJsFactory = () => {
			const chartJS = require('chart.js');
			require('chartjs-plugin-datalabels');
			delete require.cache[require.resolve('chart.js')];
			delete require.cache[require.resolve('chartjs-plugin-datalabels')];
			return chartJS;
		};
		const canvasRenderService = createSUT((chartJS) => {
			// (global as any).Chart = ChartJS;
			// ChartJS.plugins.register(freshRequire('chartjs-plugin-datalabels', require));
			// delete (global as any).Chart;
			chartJS.pluginService.register(new CanvasColour());
		}, chartJsFactory);
		const configuration: ChartConfiguration = {
			type: 'bar',
			data: {
				labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as any,
				datasets: [
					{
						label: 'Dataset 1',
						backgroundColor: colours.red,
						data: [12, 19, 3, 5, 2, 3],
						datalabels: {
							align: 'end',
							anchor: 'start'
						}
					}, {
						label: 'Dataset 2',
						backgroundColor: colours.blue,
						data: [3, 5, 2, 3, 30, 15, 19, 2],
						datalabels: {
							align: 'center',
							anchor: 'center'
						}
					}, {
						label: 'Dataset 3',
						backgroundColor: colours.green,
						data: [12, 19, 3, 5, 2, 3],
						datalabels: {
							anchor: 'end',
							align: 'start',
						}
					}
				] as any
			},
			options: {
				plugins: {
					datalabels: {
						color: 'white',
						display: (context: any) => {
							return context.dataset.data[context.dataIndex] > 15;
						},
						font: {
							weight: 'bold'
						},
						formatter: Math.round
					},
					canvasColour: canvasColourOptions
				},
				scales: {
					xAxes: [{
						stacked: true
					}],
					yAxes: [{
						stacked: true
					}]
				}
			}
		};
		const image = await canvasRenderService.renderToBuffer(configuration);
		await assertImage(image, './testData/chartjs-plugin-datalabels.png');
		// const actual = hashCode(image.toString('base64'));
		// const expected = -1377895140;
		// assert.equal(actual, expected);
	});

	it('works with custom font', async () => {

		const configuration: ChartConfiguration = {
			type: 'bar',
			data: {
				labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
				datasets: [
					{
						label: 'Number of Votes',
						data: [12, 19, 3, 5, 2, 3],
						backgroundColor: [
							colours.red,
							colours.orange,
							colours.yellow,
							colours.green,
							colours.purple,
							colours.orange,
						],
					}
				]
			},
			options: {
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true,
							//callback: (value: number) => value
						} as any
					}]
				},
				plugins: {
					annotation: {
					},
					canvasColour: canvasColourOptions,
				}
			},
		};
		const canvasRenderService = createSUT((chartJS) => {

			chartJS.defaults.global.defaultFontFamily = 'custom-font';
			chartJS.pluginService.register(new CanvasColour());
		});
		canvasRenderService.registerFont('./testData/VTKS UNAMOUR.ttf', { family: 'custom-font' });
		const image = await canvasRenderService.renderToBuffer(configuration);
		await assertImage(image, './testData/font.png');
	});

	it('does not leak with new instance', async () => {

		const diffs = await Promise.all(range(4).map((iteration) => {
			const heapDiff = new memwatch.HeapDiff();
			console.log('generated heap for iteration ' + (iteration + 1));
			const canvasRenderService = createSUT();
			return canvasRenderService.renderToBuffer(defaultConfiguration, 'image/png')
				.then(() => {
					const diff = heapDiff.end();
					console.log('generated diff for iteration ' + (iteration + 1));
					return diff;
				});
		}));
		const actual = diffs.map(d => d.change.size_bytes);
		const expected = actual.slice().sort();
		assert.notDeepEqual(actual, expected);
	});

	it('does not leak with same instance', async () => {

		const canvasRenderService = createSUT();
		const diffs = await Promise.all(range(4).map((iteration) => {
			const heapDiff = new memwatch.HeapDiff();
			console.log('generated heap for iteration ' + (iteration + 1));
			return canvasRenderService.renderToBuffer(defaultConfiguration, 'image/png')
				.then(() => {
					const diff = heapDiff.end();
					console.log('generated diff for iteration ' + (iteration + 1));
					return diff;
				});
		}));
		const actual = diffs.map(d => d.change.size_bytes);
		const expected = actual.slice().sort();
		assert.notDeepEqual(actual, expected);
	});

	function renameFile(filePath: string, renameFunc: (baseName: string) => string): string {
		const pathObj = parse(filePath);
		pathObj.base = `${renameFunc(pathObj.name)}${pathObj.ext}`;
		return format(pathObj);
	}

	function range(count: number): Array<number> {

		return [...Array(count).keys()];
	}

	function hashCode(string: string): number {

		// tslint:disable: no-bitwise no-let
		let hash = 0;
		if (string.length === 0) {
			return hash;
		}
		for (let i = 0; i < string.length; i++) {
			const chr = string.charCodeAt(i);
			hash = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
		// tslint:enable: no-bitwise no-let
	}
});
