import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import * as strings from 'ChartDemoAdaptiveCardExtensionStrings';
import { IChartDemoAdaptiveCardExtensionProps, IChartDemoAdaptiveCardExtensionState } from '../ChartDemoAdaptiveCardExtension';
import svgToTinyDataUri from "mini-svg-data-uri"

export interface IQuickViewData {
  subTitle: string;
  title: string;
  chartSVG: string;
}

interface RemoteData {
  rows: {
    label: string;
    value: number;
  }[]
}

export class QuickView extends BaseAdaptiveCardView<
  IChartDemoAdaptiveCardExtensionProps,
  IChartDemoAdaptiveCardExtensionState,
  IQuickViewData
> {
  public get data(): IQuickViewData {

    function getData(): RemoteData {
      return {
        rows: [
          {
            label: "Committed",
            value: 70000000,
          },
          {
            label: "Committed At Risk",
            value: 97000000,
          },
          {
            label: "Uncommitted Upside",
            value: 46000000,
          },
          {
            label: "Uncommitted",
            value: 48000000,
          },
        ]
      };
    }

    // from: https://stackoverflow.com/questions/36734201/how-to-convert-numbers-to-million-in-javascript
    function convertToInternationalCurrencySystem(labelValue: number): string | number {

      // Nine Zeroes for Billions
      return Math.abs(Number(labelValue)) >= 1.0e+9

        ? (Math.abs(Number(labelValue)) / 1.0e+9).toFixed(0) + "B"
        // Six Zeroes for Millions 
        : Math.abs(Number(labelValue)) >= 1.0e+6

          ? (Math.abs(Number(labelValue)) / 1.0e+6).toFixed(0) + "M"
          // Three Zeroes for Thousands
          : Math.abs(Number(labelValue)) >= 1.0e+3

            ? (Math.abs(Number(labelValue)) / 1.0e+3).toFixed(0) + "K"

            : Math.abs(Number(labelValue));

    }

    function generateChartSVG(data: RemoteData, title: string = "Qualified Pipeline By Recommendation"): string {

      const svg = [];

      // svg open tag + aria title
      svg.push("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' aria-labelledby='title' role='img' viewBox='0 0 500 263' class='main'>");
      svg.push(`<title id='title'>Chart showing: ${title}</title>`);

      // style information for the svg
      svg.push("<style type='text/css'>");

      // svg.push(".main {  }");
      svg.push(".heading { font: bold 20px sans-serif; }");
      svg.push(".leftHeading { font: 12px sans-serif; }");
      svg.push(".barValue { font: 14px solid sans-serif; }");
      svg.push(".legend { font: 10px sans-serif; }");

      svg.push("</style>");

      // chart title
      svg.push(`<text y='8%' x='50%' class='heading' text-anchor='middle' lengthAdjust='spacingAndGlyphs' textLength='70%'>${title}</text>`)

      const valueMax = data.rows.sort((a, b) => b.value - a.value)[0].value;
      console.log(`valueMax: ${valueMax}`);

      // bar rows
      data.rows.map((row, index) => {

        // -- left side label
        // we give our label 25% of the svg so there is room for longer labels
        svg.push(`<text y='${(index * 18) + 22}%' x='25%' class='leftHeading' text-anchor='end'>${row.label}</text>`);

        // -- main value bar
        // 27% == 0 on our value bar
        // 95% == valueMax on our valur bar
        // 95 - 27 = 68 points on our line, so score is 0% = x:27%, 50% = x:34%, 100% = x:95%

        // this finds what percent the current value is out of our max value
        // then what percent that percentage is of 68 (the number of points in our "line space")
        const percent = ((((row.value / valueMax) * 100) * 68) / 100);

        // percent as calculated is the width of our value bar (0=27%, 100=95%)
        svg.push(`<rect y='${(index * 18) + 16}%' x='27%' width='${percent.toFixed(0)}%' height='8%' fill='blue'></rect>`);

        // here we need to do some calculations to ensure that the value bubble which we usually place after the value bar
        // doesn't exceed the 100% boundary.
        let bubbleX = percent + 29;
        if ((bubbleX + 10) > 95) {
          // and if we are moving it we add a bit of padding so it isn't up against the side
          bubbleX = bubbleX - (bubbleX - 82);
        }

        // -- value label
        svg.push(`<text y='${(index * 18) + 22}%' x='${(bubbleX + 5).toFixed(0)}%' class='barValue' text-anchor='middle'>$${convertToInternationalCurrencySystem(row.value)}</text>`);

        // -- grey value bubble
        svg.push(`<rect y='${(index * 18) + 16}%' x='${bubbleX.toFixed(0)}%' opacity='0.3' rx='3' ry='3' width='10%' height='8%' fill='grey'></rect>`);

      });

      // setting up the legend lines
      // these are based on our zero mark being at 27%, our max mark at 95%, and our mid-point at 61%
      svg.push("<line x1='27%' y1='14%' x2='27%' y2='88%' stroke='black' stroke-dasharray='1,5' />");
      svg.push("<line x1='61%' y1='14%' x2='61%' y2='88%' stroke='black' stroke-dasharray='1,5' />");
      svg.push("<line x1='95%' y1='14%' x2='95%' y2='88%' stroke='black' stroke-dasharray='1,5' />");

      // setting up the legend text values
      // these are based on our zero mark being at 27%, our max mark at 95%, and our mid-point at 61%
      svg.push("<g text-anchor='middle' class='legend' fill='black'>");
      svg.push("<text text-anchor='start' x='25%' y='92%'>$0M</text>");
      svg.push(`<text text-anchor='middle' x='61%' y='92%'>$${convertToInternationalCurrencySystem(valueMax / 2)}</text>`);
      svg.push(`<text text-anchor='end' x='97%' y='92%'>$${convertToInternationalCurrencySystem(valueMax)}</text>`);
      svg.push("</g>");

      // close svg tag
      svg.push("</svg>");

      return svgToTinyDataUri(svg.join(""));
    }
    // show loading

    // if {

    // has cached svg => use it

    // else {

    // fetch data (from cache or server)

    // create svg

    // use it

    const svg = generateChartSVG(getData(), "Qualified Pipeline By Recommendation");

    return {
      subTitle: strings.SubTitle,
      title: strings.Title,
      chartSVG: svg,
    };
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuickViewTemplate.json');
  }
}