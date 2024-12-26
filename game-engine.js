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

  var newGameBtn = document.getElementById("new_game");
  newGameBtn.addEventListener("click", newGame);

  setInterval(frame, 0);

  document.addEventListener("keydown", keyDown);

  setInterval(showFps, 1000);

  for (const building of config.buildings) {
    buildingImages[building.type] = new Image();
    buildingImages[building.type].src = building.type + ".png";
  }
}

function newGame(e) {
  mainMenu.style.visibility = "hidden";

  game.status = "running";
  game.control_state = "none";
  game.resources = {};
  for (const resource of config.resources) {
    game.resources[resource.type] = resource.initial_amount;
  }

  console.log(game);
}

function keyDown(e) {
  if (e.repeat) {
    return; // skip all repeated keydown events
  }

  console.log(`Key "${e.key}" repeating [event: keydown]`);
  if (e.key == "Escape") {
    if (game.status == "running") {
      game.status = "paused";
      mainMenu.style.visibility = "visible";
    } else if (game.status == "paused") {
      game.status = "running";
      mainMenu.style.visibility = "hidden";
    }
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
    }
  }  
}

function canvasMouseMove(e) {
  var mouse = {x: e.offsetX / canvasScale, y: e.offsetY / canvasScale};
  if (game.control_state == "building") {
    if (mouse.x < 1280) {
      game.building_mode.x = Math.floor(mouse.x / 32);
      game.building_mode.y = Math.floor(mouse.y / 32);
    } else {
      delete game.building_mode.x;
      delete game.building_mode.y;
    }
  }
}

const resourceWidgetWidth = 320 / Object.keys(config.resources).length;

function drawResource(resourceType, amount, canvasCtx, x, y) {
  canvasCtx.fillStyle = config.resourceMap[resourceType].color;
  canvasCtx.fillRect(x, y, 32, 32);
  canvasCtx.fillStyle = "#000";
  canvasCtx.fillText(amount, x + 40, y + 5);
}

function frame() {
  if (game.status != "running") {
    return;
  }

  // Draw the field
  var canvasCtx = canvas.getContext("2d");
  canvasCtx.fillStyle = config.background;
  canvasCtx.fillRect(0, 0, 1280, 1024);
  if (game.control_state == "building") {
    canvasCtx.strokeStyle = "black";
    for (var x = 0; x < 40; x++) {
      for (var y = 0; y < 32; y++) {
        canvasCtx.strokeRect(x * 32, y * 32, 32, 32);
      }
    }
    if (game.building_mode.x != undefined) {
      canvasCtx.drawImage(buildingImages[game.building_mode.type], game.building_mode.x * 32, game.building_mode.y * 32);
    }
  }

  // Draw the control area
  var controlAreaX = 1280;
  canvasCtx.fillStyle = "#fff";
  canvasCtx.fillRect(controlAreaX, 0, 320, 1024);

  var i = 0;
  canvasCtx.font = "20px serif";
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

    canvasCtx.drawImage(buildingImages[building.type], 
        0, 0, buildingImages[building.type].naturalWidth, buildingImages[building.type].naturalHeight,
        controlAreaX, buildingYOffset + 32, 64, 64);

    canvasCtx.fillText("Cost: ", controlAreaX + 72, buildingYOffset + 37);
    var j = 0;
    for (const resourceType in building.building_cost) {
      drawResource(resourceType, building.building_cost[resourceType], canvasCtx, controlAreaX + 160 + j * 64, buildingYOffset + 32);
      j++;
    }
    if (building.profit) {
      canvasCtx.fillText("Profit: ", controlAreaX + 72, buildingYOffset + 69);
      j = 0;
      for (const resourceType in building.profit) {
        drawResource(resourceType, building.profit[resourceType], canvasCtx, controlAreaX + 160 + j * 64, buildingYOffset + 64);
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