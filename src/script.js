const makerjs = require('makerjs');

function generate(width, height, spacing, turns) {
  // coordinate system: 0, 0 is bottom left corner
  const pathObject = [];

  let x = 0;
  let y = 0;
  let dx = width;
  let dy = height;
  let prevX = 0;
  let prevY = 0;

  for (let edge = 0; edge < turns * 4; edge++) {
    prevX = x;
    prevY = y;

    if (edge >= 3) {
      if (edge % 2 == 0) {
        // vertical
        dy -= spacing;
      } else {
        // horizontal
        dx -= spacing;
      }
    }

    const side = edge % 4;
    if (side == 0) {
      // up
      y += dy;
    } else if (side == 1) {
      // right
      x += dx;
    } else if (side == 2) {
      // down
      y -= dy;
    } else if (side == 3) {
      // left
      x -= dx;
    }

    pathObject.push(new makerjs.paths.Line([prevX, prevY], [x, y]));
  }

  // move to center in two steps
  prevX = x;
  y = height / 2;
  pathObject.push(new makerjs.paths.Line([prevX, prevY], [x, y]));
  prevY = y;
  x = width / 2;
  pathObject.push(new makerjs.paths.Line([prevX, prevY], [x, y]));

  const model = {
    paths: pathObject
  };
  return model;
}

function render(model, output) {
  // zoom in on model
  const svg = makerjs.exporter.toSVG(model)
    .replace(/ width="\d+"/g, ` width="${output.offsetWidth}"`)
    .replace(/ height="\d+"/g, ` height="${output.offsetHeight}"`);

  output.innerHTML = svg;
}

function enableDownload(model, link, type) {
  let downloadData;
  if (type === 'svg') {
    downloadData = makerjs.exporter.toSVG(model);
  } else if (type === 'dxf') {
    downloadData = makerjs.exporter.toDXF(model);
  } else {
    console.log(type, ' is not a valid type');
    return;
  }

  const fileName = 'coil.' + type;
  const file = new Blob([downloadData], {type: 'text/plain'});
  link.setAttribute('href', window.URL.createObjectURL(file));
  link.setAttribute('download', fileName);
}

const outputPanel = document.getElementById('output-panel');
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const spacingInput = document.getElementById('spacing-input');
const turnsInput = document.getElementById('turns-input');

function runGeneration() {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  const spacing = Number(spacingInput.value);
  const turns = Number(turnsInput.value);

  const model = generate(width, height, spacing, turns);
  render(model, outputPanel);

  const downloadSvgButton = document.getElementById('download-svg');
  const downloadDxfButton = document.getElementById('download-dxf');
  enableDownload(model, downloadSvgButton, 'svg');
  enableDownload(model, downloadDxfButton, 'dxf');
}

// run on start to show default output
runGeneration();

document.getElementById('generate-button').addEventListener('click', () => {
  runGeneration();
});