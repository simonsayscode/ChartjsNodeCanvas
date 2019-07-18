import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import { ChartConfiguration } from 'chart.js';

import { CanvasRenderService, ChartCallback, CanvasType, MimeType } from './';

describe(CanvasRenderService.name, () => {

	const colours = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};
	const width = 400;
	const height = 400;
	const configuration: ChartConfiguration = {
		type: 'bar',
		data: {
			labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
			datasets: [{
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
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
						callback: (value: number) => '$' + value
					} as any
				}]
			}
		},
		plugins: {
			annotation: {
			}
		} as any
	};
	const chartCallback: ChartCallback = (ChartJS) => {

		ChartJS.defaults.global.responsive = true;
		ChartJS.defaults.global.maintainAspectRatio = false;
	};

	const testData: ReadonlyArray<[CanvasType | undefined, ReadonlyArray<MimeType>]> = [
		[undefined, ['image/png', 'image/jpeg']],
		//['svg', ['image/svg+xml']],
		//['pdf', ['application/pdf']]
	];

	testData.forEach(([type, mimeTypes]) => {

		describe(`given chartType ${type}`, () => {

			mimeTypes.forEach((mimeType) => {

				describe(`given mimeType '${mimeType}'`, () => {

					function createSUT(): CanvasRenderService {

						return new CanvasRenderService(width, height, chartCallback, type);
					}

					describe(CanvasRenderService.prototype.renderToBuffer.name, () => {

						it('renders buffer', async () => {
							const canvasRenderService = createSUT();
							const image = await canvasRenderService.renderToBuffer(configuration, mimeType);
							assert.equal(image instanceof Buffer, true);
						});

						it('renders buffer sync', () => {
							const canvasRenderService = createSUT();
							const image = canvasRenderService.renderToBufferSync(configuration, mimeType);
							assert.equal(image instanceof Buffer, true);
						});

						it('renders buffer in parallel', async () => {
							const canvasRenderService = createSUT();
							const promises = Array(3).fill(undefined).map(() => canvasRenderService.renderToBuffer(configuration, mimeType));
							const images = await Promise.all(promises);
							images.forEach((image) => assert.equal(image instanceof Buffer, true));
						});
					});

					describe(CanvasRenderService.prototype.renderToDataURL.name, () => {

						it('renders data url', async () => {
							const canvasRenderService = createSUT();
							const dataUrl = await canvasRenderService.renderToDataURL(configuration, mimeType);
							assert.equal(dataUrl.startsWith(`data:${mimeType};base64,`), true);
						});

						it('renders data url sync', () => {
							const canvasRenderService = createSUT();
							const dataUrl = canvasRenderService.renderToDataURLSync(configuration, mimeType);
							assert.equal(dataUrl.startsWith(`data:${mimeType};base64,`), true);
						});

						it('renders data url in parallel', async () => {
							const canvasRenderService = createSUT();
							const promises = Array(3).fill(undefined).map(() => canvasRenderService.renderToDataURL(configuration, mimeType));
							const dataUrls = await Promise.all(promises);
							dataUrls.forEach((dataUrl) => assert.equal(dataUrl.startsWith(`data:${mimeType};base64,`), true));
						});
					});

					describe(CanvasRenderService.prototype.renderToStream.name, () => {

						if (mimeType === 'image/svg+xml') {
							return;
						}

						it('renders stream', (done) => {
							const canvasRenderService = createSUT();
							const stream = canvasRenderService.renderToStream(configuration, mimeType);
							const data: Array<Buffer> = [];
							stream.on('data', (chunk: Buffer) => {
								data.push(chunk);
							});
							stream.on('end', () => {
								assert.equal(Buffer.concat(data).length > 0, true);
								done();
							});
							stream.on('finish', () => {
								assert.equal(Buffer.concat(data).length > 0, true);
								done();
							});
							stream.on('error', (error) => {
								done(error);
							});
						});
					});
				});
			});
		});
	});
});
