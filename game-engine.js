// DOM elements
var mainMenu;
var canvas;
var fps;

// Others
var canvasScale;

var game = {
  status: "none",
};

var buildingImages = {};
var buildingIcons = {};
var buildingDefinitions = {};

var frameCounter = 0;

function gameEngineInit() {
  // Build a look-up table for resouces and buildings.
  config.resourceMap = {};
  for (const resource of config.resources) {
    config.resourceMap[resource.type] = resource;
  }
  config.buildingMap = {};
  for (const building of config.buildings) {
    config.buildingMap[building.type] = building;
  }

  mainMenu = document.getElementById("main_menu");
  canvas = document.getElementById("game_field");
  fps = document.getElementById("fps");

  const widthScale = (window.innerWidth - 1) / 1600;
  const heightScale = (window.innerHeight - 1) / 1024;
  canvasScale = widthScale < heightScale ? widthScale : heightScale;
  canvas.style.width = canvasScale * 1600 + "px";
  canvas.style.height = canvasScale * 1024 + "px";
  canvas.style.top = (window.innerHeight - canvasScale * 1024) / 2 + "px";
  canvas.style.left = (window.innerWidth - canvasScale * 1600) / 2 + "px";
  canvas.addEventListener("click", canvasClicked);
  canvas.addEventListener("mousemove", canvasMouseMove);
  canvas.addEventListener('contextmenu', canvasRightClicked);

  var newGameBtn = document.getElementById("new_game");
  newGameBtn.addEventListener("click", newGame);

  setInterval(frame, 0);

  document.addEventListener("keydown", keyDown);

  setInterval(showFps, 1000);

  for (const building of config.buildings) {
    buildingDefinitions[building.type] = building;
    buildingImages[building.type] = new Image();
    buildingImages[building.type].src = building.type + ".png";
    buildingIcons[building.type] = new Image();
    buildingIcons[building.type].src = building.type + "-icon.png";
  }
}

function hasBuildingAt(x, y) {
  for (const building of game.buildings) {
    const buildingDef = buildingDefinitions[building.type];
    if (x >= building.x && x < building.x + buildingDef.width && y >= building.y && y < building.y + buildingDef.height) return true;
  }

  return false;
}

function hasResourceMineAt(x, y) {
  for (const resource_mine of game.resource_mines) {
    if (resource_mine.x == x && resource_mine.y == y) return true;
  }

  return false;
}

function newGame(e) {
  mainMenu.style.visibility = "hidden";

  game.status = "running";
  game.control_state = "none";
  game.resources = {};
  for (const resource of config.resources) {
    game.resources[resource.type] = resource.initial_amount;
  }

  game.buildings = [{type: "base", x: config.map.cols / 2 - 1, y: config.map.rows / 2 - 1}];
  game.resource_mines = [];

  for (const resource_mine of config.map.resource_mines) {
    for (var i = 0; i < resource_mine.numbers; i++) {
      var x, y;
      do {
        x = getRandomInt(config.map.cols);
        y = getRandomInt(config.map.rows);
      } while (hasResourceMineAt(x, y) || hasBuildingAt(x, y));
      game.resource_mines.push({type: resource_mine.type, x: x, y: y});
    }
  }

  game.viewport = {
    x: Math.floor(config.map.cols / 2 - 20),
    y: Math.floor(config.map.rows / 2 - 16),
  };

  console.log(game);
}

function keyDown(e) {
  console.log(`Key "${e.key}" pressed [event: keydown]`);
  if (e.key == "Escape" && !e.repeat) {
    if (game.status == "running") {
      game.status = "paused";
      mainMenu.style.visibility = "visible";
    } else if (game.status == "paused") {
      game.status = "running";
      mainMenu.style.visibility = "hidden";
    }
  }
  if ((e.key == "w" || e.key == "ArrowUp") && game.viewport.y > 0) {
    game.viewport.y--;
  }
  if ((e.key == "s" || e.key == "ArrowDown") && game.viewport.y < config.map.rows - 32) {
    game.viewport.y++;
  }
  if ((e.key == "a" || e.key == "ArrowLeft") && game.viewport.x > 0) {
    game.viewport.x--;
  }
  if ((e.key == "d" || e.key == "ArrowRight") && game.viewport.x < config.map.cols - 40) {
    game.viewport.x++;
  }  
}

function canvasClicked(e) {
  var mouse = {x: e.offsetX / canvasScale, y: e.offsetY / canvasScale};
  if (mouse.x > 1280) {
    if (mouse.y > 32 && mouse.y < 32 + Object.keys(config.buildings).length * 96) {
      // selected a building
      var i = Math.floor((mouse.y - 32) / 96);
      game.control_state = "building";
      game.building_mode = {type: config.buildings[i].type};
      canvas.style.cursor = "grabbing";
    }
  }  
}

function canvasRightClicked(e) {
  e.preventDefault();
  if (game.control_state == "building") {
    game.control_state = "none";
    delete game.building_mode;
    canvas.style.cursor = "auto";
  }
}

function canvasMouseMove(e) {
  var mouse = {x: e.offsetX / canvasScale, y: e.offsetY / canvasScale};
  if (game.control_state == "building") {
    if (mouse.x < 1280) {
      game.building_mode.x = Math.floor(mouse.x / 32);
      game.building_mode.y = Math.floor(mouse.y / 32);
      canvas.style.cursor = "none";
    } else {
      delete game.building_mode.x;
      delete game.building_mode.y;
      canvas.style.cursor = "grabbing";
    }
  } else {
    canvas.style.cursor = "auto";
  }
}

const resourceWidgetWidth = 320 / Object.keys(config.resources).length;

function drawResource(resourceType, amount, canvasCtx, x, y) {
  canvasCtx.fillStyle = config.resourceMap[resourceType].color;
  canvasCtx.fillRect(x, y, 32, 32);
  canvasCtx.fillStyle = "#000";
  canvasCtx.fillText(amount, x + 36, y + 5);
}

function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  const xOverlaped = (x1 >= x2 && x1 < x2 + w2) || (x1 + w1 >= x2 && x1 + w1 < x2 + w2);
  const yOverlaped = (y1 >= y2 && y1 < y2 + h2) || (y1 + h1 >= y2 && y1 + h1 < y2 + h2);
  return xOverlaped && yOverlaped;
}

function frame() {
  if (game.status != "running") {
    return;
  }

  // Draw the field
  var canvasCtx = canvas.getContext("2d");
  canvasCtx.fillStyle = config.background;
  canvasCtx.fillRect(0, 0, 1280, 1024);
  // Draw map
  for (const resource_mine of game.resource_mines) {
    if (resource_mine.x >= game.viewport.x && resource_mine.x < game.viewport.x + 40 &&
      resource_mine.y >= game.viewport.y && resource_mine.y < game.viewport.y + 32) {
        var resource = findResourceDefinition(resource_mine.type);
        canvasCtx.fillStyle = resource.color;
        canvasCtx.fillRect((resource_mine.x - game.viewport.x) * 32, (resource_mine.y - game.viewport.y) * 32, 32, 32);
      }
  }
  for (const building of game.buildings) {
    const buildingDef = buildingDefinitions[building.type];
    if (rectsOverlap(building.x, building.y, buildingDef.width, buildingDef.height, game.viewport.x, game.viewport.y, 40, 32)) {
      canvasCtx.drawImage(buildingImages[building.type], (building.x - game.viewport.x) * 32, (building.y - game.viewport.y) * 32);
    }
  }

  if (game.control_state == "building") {
    canvasCtx.strokeStyle = "black";
    for (var x = 0; x < 40; x++) {
      for (var y = 0; y < 32; y++) {
        canvasCtx.strokeRect(x * 32, y * 32, 32, 32);
      }
    }
    if (game.building_mode.x != undefined) {
      canvasCtx.globalAlpha = 0.33;
      canvasCtx.drawImage(buildingImages[game.building_mode.type], game.building_mode.x * 32, game.building_mode.y * 32);
      canvasCtx.globalAlpha = 1;
    }
  }

  // Draw the control area
  var controlAreaX = 1280;
  canvasCtx.fillStyle = "#fff";
  canvasCtx.fillRect(controlAreaX, 0, 320, 1024);

  var i = 0;
  canvasCtx.font = "16px serif";
  canvasCtx.textBaseline = "top";
  for (const resource of config.resources) {
    drawResource(resource.type, game.resources[resource.type], canvasCtx, controlAreaX + i * resourceWidgetWidth, 0);
    i++;
  }

  i = 0;
  for (const building of config.buildings) {
    var buildingYOffset = 32 + i * 96;
    canvasCtx.fillStyle = "#000";
    canvasCtx.fillText(building.title, controlAreaX + 4, buildingYOffset + 5);
    canvasCtx.drawImage(buildingIcons[building.type], controlAreaX, buildingYOffset + 32);
    canvasCtx.fillText("Cost: ", controlAreaX + 72, buildingYOffset + 37);
    var j = 0;
    for (const resourceType in building.building_cost) {
      drawResource(resourceType, building.building_cost[resourceType], canvasCtx, controlAreaX + 132 + j * 70, buildingYOffset + 32);
      j++;
    }
    if (building.profit) {
      canvasCtx.fillText("Profit: ", controlAreaX + 72, buildingYOffset + 69);
      j = 0;
      for (const resourceType in building.profit) {
        drawResource(resourceType, building.profit[resourceType], canvasCtx, controlAreaX + 132 + j * 70, buildingYOffset + 64);
        j++;
      }
    }
    i++;
  }

  frameCounter++;
}

function showFps() {
  fps.textContent = "FPS: " + frameCounter;
  frameCounter = 0;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max); 
}

function findResourceDefinition(resourceType) {
  for (const resource of config.resources) {
    if (resource.type == resourceType) return resource;
  }
}
