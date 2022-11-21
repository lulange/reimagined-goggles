// global variable for canvas object (nice for .width and .height properties)
const canvas = document.getElementById("canvas");
canvas.height = window.innerHeight;

// for the Game class DO NOT ACCESS DIRECTLY use game.startLoop(); and game.stopLoop(); to start and stop animation looping
let gameLoopController = {
  funciton: null, // the function will be defined as the current scene's loop function
  loop: null, // the loop function call the previous function and cals a request for animation frame
  // (this is so that you don't have to include requestAnimationFrame in all of your scenes and to make it more controllable)
  isLooping: false // used to determine whether a new animation frame should be requested
};

/*
  Main Game class: only one instance of this will be created
  Use of Game will flow like this:
  * Game class definition
  * game instance creation
  * game scenes added using .addScene
  * game started with a kick off .runScene
*/
class Game {
  constructor(ctx) {
    this.ctx = ctx; // literally the 2d rendering context used to render everything
    this.scenes = []; // game scenes array
    /*
      Each scene will be an object added in the form
      {
        startFunction: pre loop function that runs to setup any necessary things not in loop
        loopFunction: function that runs as the game loop
        key: the identifier for the scene
        data: data the scene is being run with currently
      }
    */
    this.currScene = null; // stores a reference to the current scene object (stores the object itself essentially)
  }

  // runs the scene given and sets the scene's data storage to scene data to act similarly to parameters when necessary
  // also starts loop
  runScene(sceneKey, sceneData) {
    // if no data given then assign empty object
    if (sceneData === undefined) {
      sceneData = {};
    }
    // if gameLoopController is set to not loop, then set to loop
    if (gameLoopController.isLooping === false) {
      gameLoopController.isLooping = true;
    }

    // for loop through the scenes array to find the scene with the matching key
    for (let i=0; i<this.scenes.length; i++) {
      if (this.scenes[i].key === sceneKey) {
        // set currScene and the data for that scene
        this.currScene = this.scenes[i];
        this.currScene.data = sceneData; // *also sets the data for the scene in scenes array because currentscene is a reference to the same data
        this.currScene.startFunction(); // call the setup function
        // setup gameLoopController
        gameLoopController.function = this.currScene.loopFunction;
        gameLoopController.loop = (timestamp) => {
          gameLoopController.function();
          // so that looping is controllable to stop and start
          if (gameLoopController.isLooping === true) {
            window.requestAnimationFrame(gameLoopController.loop);
          }
        };
        gameLoopController.loop();
        break; // break out of the for loop when correct scene is found
      }
    }
  }

  // addScene is fairly self-explanatory: use arrow functions for the function parameters so that the context is the window and not gameLoopController
  addScene(startFunction, loopFunction, key) {
    // add an object in the format I laid out above for scenes
    this.scenes.push({
      startFunction: startFunction,
      loopFunction: loopFunction,
      key: key,
      data: {}
    });
  }

  // call this to stop the looping in the middle of a scene (possibly a pause feature might need this)
  stopLoop() {
    gameLoopController.isLooping = false;
  }

  // call this to start the loop back up. again fairly self-explanatory
  startLoop() {
    gameLoopController.isLooping = true;
    gameLoopController.loop(); // continues loop on same scene unlike runScene which uses a new scene and calls the setup function
  }
}



// example setup
let game = new Game(canvas.getContext("2d"));


game.addScene(() => {
  // setup code for scene in here
  // access properties of game variable here by using "game" rather than "this"
  game.ctx.font = game.currScene.data.exampleData;
}, () => {
  game.ctx.fillStyle = "white";
  game.ctx.fillRect(0, 0, canvas.width, canvas.height);
  game.ctx.fillStyle = "black";
  let date = new Date().toLocaleTimeString();
  game.ctx.fillText(date, 20, 50);
}, "example-scene");

// run the first scene to start up the game
// (sceneKey, [sceneData]) scene data defaults to a blank object if not given. Always pass it as an object!
game.runScene("example-scene", {exampleData: "bold 30px Helvetica"});
