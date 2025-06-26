let trees_x = []; // Array of trees
let clouds = []; // Array of Clouds
let mountains = []; //Array of mountains
let canyon = []; // Array of canyons
let collectables = []; // Array to hold multiple collectables
let enemies = [];
let platforms = []; // Array to hold platforms
let lastCloud_x; // Tracks the rightmost cloud
let cameraPos_x;
let gameChar_x; // Character's x position
let gameChar_y; // Character's y position (base position)
let scaleFactor = 0.48;
let gravity = 1; // Gravity for falling
let jumpStrength = -18; // Higher jump
let isOnGround = true; // To check if the character is on the ground
let groundLevel = 236;
let jumpCooldown = 0;
let landingSpeed = 0.8; // Adjust this value between 0.05-0.3 (lower = smoother/slower)
let target_y = null;
let score = 0; // Score
let font; // Customzed Font
let lives = 3; // Start with 3 lives
function preload() {
  font = loadFont("Font/ByteBounce.ttf"); // Adding the path to the font file
  heartImage = loadImage("Images/pixel-heart-2779422.png"); // Heart Image to represent the character's lives
  collectSound = loadSound("Sounds/collect-ring-15982.mp3"); // Load Collect Item Sound
  bgMusic = loadSound("Sounds/Ancient Egyptian Music  Desert Sphinx.mp3"); //  Load background music
  deathSound = loadSound("Sounds/pixel-death-66829.mp3"); // Load Death Sound
  gameOverSound = loadSound("Sounds/game-over-38511.mp3"); // Load Game Over Sound
  jumpSound = loadSound("Sounds/8-bit-jump-001-171817.mp3"); // Load Jump Sound
  winSound = loadSound("Sounds/you-win-sequence-2-183949.mp3"); // Load Win Sound
  enemyImg = loadImage("Images/zoe-gonzalez-t3zoegonzalezidle02.gif"); // Load enemy GIF
  meowSound = loadSound("Sounds/cat-meow-7-fx-306186.mp3"); // Meow sound when the character touches the enemy
  winVideo = createVideo(
    "Images/footage_and_after_effects_project_light_speed_starwars (1080p).mp4"
  );
  winVideo.hide(); // Hide default video element
  platformImg = loadImage("Images/Wooden_platform_sprite_for_video_game.png");
}

function setup() {
  createCanvas(1024, 576);
  floosPos_y = (height * 3) / 4;
  cameraPos_x = 0;
  gameChar_x = 200;
  gameChar_y = floosPos_y;
  score = 0; // Initialize score to 0

  isLeft = false;
  isRight = false;
  isPlummeting = false;
  isJumping = false;
  isFound = false;
  onPlatform = false; // Flag to check if the character is standing on a platform

  // Ensure the background music plays when the game starts
  if (!bgMusic.isPlaying()) {
    bgMusic.loop();
    bgMusic.setVolume(0.5); // Adjust volume
  }

  // Platforms
  platforms = [
    createPlatform(400, 290, 100, 20),
    createPlatform(800, 290, 100, 20),
    createPlatform(1200, 290, 100, 20),
    createPlatform(1600, 290, 100, 20),
    createPlatform(2000, 290, 100, 20),
    createPlatform(2400, 290, 100, 20),
  ];

  // Collectables
  collectables = [
    { x_pos: 200, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
    { x_pos: 900, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
    { x_pos: 1200, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
    { x_pos: 1500, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
    { x_pos: 1800, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
    { x_pos: 2100, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
    { x_pos: 2450, y_pos: floosPos_y - 100, size: 0.16, isFound: false },
  ];

  // Define an array of canyon
  canyon = [
    { x: 500, y: 400, width: 180, height: 176 }, // First canyon
    { x: 1100, y: 400, width: 180, height: 176 },
    { x: 1700, y: 400, width: 180, height: 176 },
    { x: 2300, y: 400, width: 180, height: 176 }, // Second canyon, 400 pixels away
  ];

  for (let i = 0; i < canyon.length - 1; i++) {
    let x1 = canyon[i].x;
    let x2 = canyon[i + 1].x;

    let enemyX = (x1 + x2) / 2; // Center enemy between canyons
    let enemyY = groundLevel + 170;

    enemies.push(new Enemy(enemyX, enemyY, 110, 0)); // Speed = 0 (no movement)
  }

  // Arrays of mountains (Pyramids)
  mountains = [
    {
      x: 500,
      y: 400,
      height: 400,
      width: 500,
      mainColor: color(185, 162, 110),
      shadowColor: color(155, 130, 85),
    }, // mountains 1
    {
      x: 650,
      y: 400,
      height: 340,
      width: 550,
      mainColor: color(200, 180, 130),
      shadowColor: color(170, 150, 100),
    }, // mountains 2
    {
      x: 790,
      y: 400,
      height: 290,
      width: 450,
      mainColor: color(220, 200, 160),
      shadowColor: color(190, 170, 130),
    }, // mountains 3
  ];

  // Arrays of trees
  trees_x = [
    { x: -50, y: 329, scale: 0.6 }, // Tree 1
    { x: 300, y: 329, scale: 0.6 }, // Tree 2
    { x: 750, y: 329, scale: 0.6 }, // Tree 3
    { x: 1360, y: 329, scale: 0.6 }, // Tree 4
    { x: 1960, y: 329, scale: 0.6 }, // Tree 5
    { x: 2600, y: 329, scale: 0.6 }, // Tree 6
  ];

  // Arrays of clouds
  clouds = [
    { x: 250, y: 140, size: 120 },
    { x: 450, y: 120, size: 160 },
    { x: 890, y: 100, size: 100 },
    { x: 690, y: 100, size: 105 },
  ];
  lastCloud_x = Math.max(...clouds.map((cloud) => cloud.x));
}

function draw() {
  background(176, 196, 222);

  // Sun
  drawSun(600, 200, 1.6);

  // Mountains
  for (let i = 0; i < mountains.length; i++) {
    let p = mountains[i];
    drawMountains(p.x, p.y, p.height, p.width, p.mainColor, p.shadowColor);
  }

  // Clouds
  for (let i = clouds.length - 1; i >= 0; i--) {
    let c = clouds[i];
    drawCloud(c.x, c.y, c.size);
    // Move the cloud to the left relative to the scrolling world
    c.x -= 3; // Adjust speed as needed
  }

  // Draw hearts
  for (let i = 0; i < lives; i++) {
    image(heartImage, 114 + i * 33, 13, 30, 30);
  }

  // Birds
  let birdPositions = [
    { x: 300, y: 150, size: 20 },
    { x: 470, y: 85, size: 15 },
    { x: 690, y: 180, size: 25 },
    { x: 880, y: 160, size: 20 },
  ];
  birdPositions.forEach((b) => drawBird(b.x, b.y, b.size));
  // Scrolling Scenery
  cameraPos_x = gameChar_x - width / 2;
  push();
  translate(-cameraPos_x, 0);

  // Generate Clouds
  let minDistance = 90; // Minimum distance between clouds
  if (lastCloud_x < cameraPos_x + width + 200) {
    let newCloudX = lastCloud_x + random(minDistance, minDistance + 200);
    let newCloud = {
      x: newCloudX, // Start farther apart
      y: random(50, 200), // Random vertical position
      size: random(80, 150), // Random cloud size
    };

    clouds.push(newCloud);
    lastCloud_x = newCloud.x; // Update the position of the last cloud
  }

  // Desert ground
  drawFloor();

  // Draw all canyon
  for (let i = 0; i < canyon.length; i++) {
    let c = canyon[i];
    drawCanyon(
      c.x,
      c.y,
      c.width,
      c.height,
      color(101, 67, 33),
      color(80, 50, 20),
      color(130, 85, 44),
      color(160, 110, 60)
    );
  }

  // Trees
  for (let i = 0; i < trees_x.length; i++) {
    let tree = trees_x[i];
    drawTree(tree.x, tree.y, tree.scale);
  }

  for (let i = 0; i < platforms.length; i++) {
    platforms[i].draw();
  }

  //Loop of collectable Items
  for (let i = 0; i < collectables.length; i++) {
    let c = collectables[i];

    if (!c.isFound) {
      drawCollectableItem(c); // Draw the collectable item
    }

    // Check collision
    if (
      dist(
        gameChar_x + 85, // Adjusted Character's x position
        gameChar_y + 230, // Character's y position
        c.x_pos, // Collectable's x position
        c.y_pos // Collectable's y position
      ) < 29
    ) {
      if (!c.isFound) {
        score += 10; // Increase score
        c.isFound = true; // Mark as found
        collectSound.play(); // 🔊 Play sound when collected!
      }
    }
  }

  // Draw the game character
  if (isPlummeting) {
    if (isLeft) {
      drawJumpingLeft(gameChar_x, gameChar_y, 0.7);
    } else if (isRight) {
      drawJumpingRight(gameChar_x, gameChar_y, 0.7);
    } else {
      drawJumpingFacingFroward(gameChar_x, gameChar_y, scaleFactor);
    }
  } else if (isLeft && isJumping) {
    drawJumpingLeft(gameChar_x, gameChar_y, 0.7);
  } else if (isRight && isJumping) {
    drawJumpingRight(gameChar_x, gameChar_y, 0.7);
  } else if (isLeft) {
    drawLeftWalking(gameChar_x, gameChar_y, 0.7);
  } else if (isRight) {
    drawRightWalking(gameChar_x, gameChar_y, 0.7);
  } else if (isJumping) {
    drawJumpingFacingFroward(gameChar_x, gameChar_y, scaleFactor);
  } else {
    drawFacingFroward(gameChar_x, gameChar_y, scaleFactor);
  }

  // Draw enemies and check for collisions
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].display();
    enemies[i].checkCollision(gameChar_x - cameraPos_x - 70, gameChar_y + 100); // Adjust for camera offset
  }
  pop();
  // INTERACTION CODE
  // Update jump cooldown
  if (jumpCooldown > 0) jumpCooldown--;

  // Apply gravity (only if not on the ground or plummeting)
  if (!isOnGround && !isPlummeting) {
    velocity_y += gravity; // Apply gravity
    gameChar_y += velocity_y; // Update vertical position
  }

  // Check platform collision - IMPROVED DETECTION
  let landedOnPlatform = false;

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];

    // Adjusted collision detection with debugging values
    const charFootY = gameChar_y + 170;
    const charCenterX = gameChar_x - 30;
    const charWidth = 100;

    // Check if the character is within the platform's horizontal bounds and landing on it
    if (
      charCenterX + charWidth > p.x - 18 &&
      charCenterX < p.x + p.width - 100 &&
      charFootY >= p.y - 15 &&
      charFootY <= p.y + 15 &&
      velocity_y >= 0
    ) {
      landedOnPlatform = true;
      velocity_y = 0; // Stop falling

      // Instead of snapping, set a target position
      target_y = p.y - 157;

      // Reset jumping state when landing on platform
      isJumping = false;

      break;
    }
  }

  // After the loop, add this to smoothly move to the target position
  if (target_y !== null) {
    // Lerp (linear interpolation) to the target
    gameChar_y = gameChar_y + (target_y - gameChar_y) * 0.6;

    // If we're very close to the target, just snap to it and clear the target
    if (Math.abs(gameChar_y - target_y) < 0.5) {
      gameChar_y = target_y;
      target_y = null;
    }
  }

  // Update isOnGround based on both ground and platform status
  isOnGround =
    landedOnPlatform || (gameChar_y === groundLevel && !isPlummeting);

  // Canyon falling detection
  for (let c of canyon) {
    if (
      gameChar_x > c.x - 70 && // Adjusted collision range
      gameChar_x < c.x + c.width - 80 && // Adjusted collision range
      gameChar_y >= groundLevel
    ) {
      isPlummeting = true;
      isOnGround = false; // Ensure no double landing
      isJumping = false; // Reset jumping state when falling into canyon
    }
  }

  // Add jump cooldown check before allowing a new jump
  if (isJumping && isOnGround && jumpCooldown <= 0) {
    velocity_y = jumpStrength; // Apply upward velocity
    isOnGround = false; // Character leaves the ground
    isJumping = false; // Prevent continuous jumping
    jumpCooldown = 10; // Set a cooldown (adjust value as needed)
  }

  // Handle landing on ground
  if (gameChar_y >= groundLevel && !isPlummeting && !landedOnPlatform) {
    gameChar_y = groundLevel; // Snap to ground level
    velocity_y = 0; // Reset vertical velocity
    isOnGround = true;
    isJumping = false; // Reset jumping state when landing on ground
  }

  // Horizontal movement
  if (isLeft && !isPlummeting) {
    gameChar_x -= 7;
  }
  if (isRight && !isPlummeting) {
    gameChar_x += 7;
  }

  // Handle plummeting
  if (isPlummeting) {
    velocity_y += gravity; // Continue applying gravity
    gameChar_y += velocity_y; // Update vertical position

    // Game over when falling off the screen
    if (gameChar_y > height) {
      lives--; // Reduce one life
      deathSound.play(); // Play death sound

      if (lives > 0) {
        resetGame(); // Reset game (score + collectables)
      }
    }
  }

  // Display score
  textFont(font);
  fill(0);
  noStroke();
  textSize(40);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 19, 35); // Display score at the top-left corner
  text(`Lives:`, 19, 12);

  // Check for Game Over AFTER everything is drawn
  if (lives === 0) {
    handleGameOver();
  }
  // Winning Condition
  if (score === 70) {
    showWinScreen();
  }
} // End of function draw()

// Sun
function drawSun(sunX, sunY, scaleFactor) {
  noStroke();
  // Sun glow layers
  fill(255, 223, 0, 50); // Outer glow (very faint yellow)
  circle(sunX, sunY, 500 * scaleFactor); // Larger faint circle

  fill(255, 223, 0, 100); // Middle glow (brighter yellow)
  circle(sunX, sunY, 350 * scaleFactor); // Larger medium circle

  fill(255, 223, 0, 150); // Inner glow (bright yellow)
  circle(sunX, sunY, 200 * scaleFactor); // Larger inner circle

  // Sun core
  fill(255, 204, 0); // Bright yellow-orange for the sun core
  circle(sunX, sunY, 120 * scaleFactor); // Core of the sun
}

// Mountains Function
function drawMountains(baseX, baseY, height, width, mainColor, shadowColor) {
  // Main mountains body
  fill(mainColor);
  noStroke();
  triangle(
    baseX - width / 2,
    baseY, // Bottom left
    baseX,
    baseY - height, // Top
    baseX + width / 2,
    baseY // Bottom right
  );
  // mountains shadow
  fill(shadowColor);
  triangle(
    baseX,
    baseY - height, // Top
    baseX + width / 2,
    baseY, // Bottom right
    baseX + width / 4,
    baseY // Shadow edge point
  );
}

// Collectable Item
function drawCollectableItem(collectable, offsetX = 0, offsetY = -100) {
  const x = collectable.x_pos + offsetX;
  const y = collectable.y_pos + offsetY;
  const scale = collectable.size;

  noFill();
  stroke(255, 223, 0); // Gold color for outline
  strokeWeight(18 * scale); // Stroke weight scales with the scale factor

  // Default key dimensions
  const keyWidth = 100; // Default width
  const keyHeight = 150; // Default height

  // Main teardrop shape
  stroke(150, 100, 0);
  beginShape();
  vertex(x, y + (keyHeight / 2) * scale); // Bottom center of the teardrop
  bezierVertex(
    x - (keyWidth / 2) * scale,
    y, // Left control point
    x - (keyWidth / 3) * scale,
    y - (keyHeight / 2) * scale, // Top left control point
    x,
    y - (keyHeight / 2) * scale // Top center point
  );
  bezierVertex(
    x + (keyWidth / 3) * scale,
    y - (keyHeight / 2) * scale, // Top right control point
    x + (keyWidth / 2) * scale,
    y, // Right control point
    x,
    y + (keyHeight / 2) * scale // Bottom center of the teardrop
  );
  endShape(CLOSE);

  fill(218, 165, 32); // Gold color for triangles
  strokeWeight(12 * scale); // Stroke weight for triangles scales with the scale factor
  // Left triangle
  triangle(
    x - 20 * scale,
    y + 78 * scale,
    x - 90 * scale,
    y + 65 * scale,
    x - 90 * scale,
    y + 89 * scale
  );
  // Mirrored right triangle
  triangle(
    x + 20 * scale,
    y + 78 * scale,
    x + 90 * scale,
    y + 65 * scale,
    x + 90 * scale,
    y + 89 * scale
  );
  // Bottom center triangle
  triangle(
    x - 1 * scale,
    y + 99 * scale, // Top point of the triangle
    x + 20 * scale,
    y + 230 * scale, // Bottom left point
    x - 20 * scale,
    y + 230 * scale // Bottom right point
  );
}

// Clouds
function drawCloud(x, y, size) {
  noStroke(); // No outline
  fill(255); // White color for the cloud

  // Define the scale factor to the default size
  let scaleFactor = size / 100;

  // Top rounded puffs
  ellipse(
    x - 30 * scaleFactor,
    y - 30 * scaleFactor,
    50 * scaleFactor,
    50 * scaleFactor
  ); // Left puff
  ellipse(
    x + 30 * scaleFactor,
    y - 30 * scaleFactor,
    50 * scaleFactor,
    50 * scaleFactor
  ); // Right puff
  ellipse(x, y - 50 * scaleFactor, 60 * scaleFactor, 60 * scaleFactor); // Center puff (slightly larger)

  // Flat bottom line for a clean finish
  stroke(255);
  strokeWeight(20 * scaleFactor); // Scaled thickness
  line(
    x - 35 * scaleFactor,
    y - 15 * scaleFactor,
    x + 35 * scaleFactor,
    y - 15 * scaleFactor
  );
}

// Infinite Floor
function drawFloor() {
  let floosPos_y = 400; // Y position of the ground
  let floorColor = color(222, 184, 100);

  // Draw the continuous ground
  noStroke();
  fill(floorColor);
  rect(cameraPos_x - width / 2, floosPos_y, width * 2, height - floosPos_y);
}

// Canyon
function drawCanyon(
  x,
  y,
  width,
  height,
  bodyColor,
  leftSlopeColor,
  rightSlopeColor,
  floorColor
) {
  noStroke();
  // Main Canyon Body
  fill(bodyColor); // Dark brown
  rect(x, y, width, height); // Main rectangular canyon body
  // Left Sloped Wall
  fill(leftSlopeColor); // Very dark brown for shadow
  triangle(x, y, x + width * 0.25, y + height, x, y + height);
  // Right Sloped Wall
  fill(rightSlopeColor); // Medium brown for the lit side
  triangle(x + width, y, x + width * 0.75, y + height, x + width, y + height);
  // Bottom Connection
  fill(floorColor); // Lighter brown for the floor
  triangle(
    x + width * 0.25,
    y + height,
    x + width * 0.75,
    y + height,
    x + width * 0.5,
    y + height + 20
  );
}

// Trees
function drawTree(x, y, size) {
  push();
  scale(size); // Scale the tree proportionally
  translate(x / size, y / size); // Adjust position to account for scaling

  // Draw the trunk
  stroke(139, 69, 19); // Brown trunk outline
  strokeWeight(4);
  fill(160, 82, 45); // Brown trunk color
  rect(-10, 0, 20, 120, 3); // Trunk at the center

  // Draw the coconuts
  fill(200, 82, 45); // Brownish-red for coconuts
  stroke(128, 0, 0); // Dark red outline
  strokeWeight(1.5);
  circle(10, -10, 10); // Top coconut
  circle(0, -5, 10); // Left coconut
  circle(20, -5, 10); // Right coconut

  // Draw the leaves
  fill(0, 100, 0); // Dark green leaves
  stroke(11, 58, 16); // Dark green outline
  strokeWeight(1.5);
  for (let i = 0; i < 10; i++) {
    ellipse(0, -40, 10, 70); // Long leaves
    rotate(PI / 5); // Rotate for each leaf
  }
  pop();
}

// Birds
function drawBird(x, y, size) {
  noFill();
  stroke(0); // Black color
  strokeWeight(2);
  arc(x - size * 0.5, y, size, size * 0.5, radians(180), radians(360)); // Left wing
  arc(x + size * 0.5, y, size, size * 0.5, radians(180), radians(360)); // Right wing
}

function createPlatform(x, y, width, height) {
  return {
    x: x,
    y: y,
    width: width,
    height: height,
    draw: function () {
      image(platformImg, this.x, this.y, this.width, this.height);
    },
    checkCollision: function (charX, charY, charWidth, charHeight) {
      if (
        charX + charWidth > this.x &&
        charX < this.x + this.width &&
        charY + charHeight > this.y &&
        charY + charHeight < this.y + this.height
      ) {
        return true; // Character is standing on the platform
      }
      return false;
    },
  };
}

// Game Character
// Front Facing
function drawFacingFroward(gameChar_x, gameChar_y, scaleFactor) {
  // Ears
  fill(0);
  stroke(139, 69, 19);
  triangle(
    gameChar_x + 130 * scaleFactor,
    gameChar_y + 256 * scaleFactor,
    gameChar_x + 150 * scaleFactor,
    gameChar_y + 231 * scaleFactor,
    gameChar_x + 136 * scaleFactor,
    gameChar_y + 217 * scaleFactor
  );
  triangle(
    gameChar_x + 160 * scaleFactor,
    gameChar_y + 235 * scaleFactor,
    gameChar_x + 177 * scaleFactor,
    gameChar_y + 217 * scaleFactor,
    gameChar_x + 180 * scaleFactor,
    gameChar_y + 234 * scaleFactor
  );
  // Head
  fill(0);
  stroke(139, 69, 19);
  rect(
    gameChar_x + 124 * scaleFactor,
    gameChar_y + 230 * scaleFactor,
    65 * scaleFactor,
    47 * scaleFactor,
    20 * scaleFactor
  );
  // Hands
  fill(0);
  stroke(139, 69, 19);
  rect(
    // Left
    gameChar_x + 186 * scaleFactor,
    gameChar_y + 285 * scaleFactor,
    15 * scaleFactor,
    30 * scaleFactor,
    10 * scaleFactor
  );
  rect(
    // Right
    gameChar_x + 116 * scaleFactor,
    gameChar_y + 285 * scaleFactor,
    15 * scaleFactor,
    30 * scaleFactor,
    10 * scaleFactor
  );
  // Legs
  fill(0);
  stroke(139, 69, 19);
  rect(
    // Right
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 310 * scaleFactor,
    17 * scaleFactor,
    30 * scaleFactor,
    10 * scaleFactor
  );
  rect(
    // Left
    gameChar_x + 140 * scaleFactor,
    gameChar_y + 310 * scaleFactor,
    17 * scaleFactor,
    30 * scaleFactor,
    10 * scaleFactor
  );
  // Torso
  fill(0);
  rect(
    gameChar_x + 133 * scaleFactor,
    gameChar_y + 278 * scaleFactor,
    50 * scaleFactor,
    40 * scaleFactor,
    15 * scaleFactor
  );
  noStroke();
  rect(
    gameChar_x + 144 * scaleFactor,
    gameChar_y + 272 * scaleFactor,
    25 * scaleFactor,
    35 * scaleFactor
  );
  // Eyes
  fill(175, 238, 238);
  stroke(72, 209, 204);
  ellipse(
    gameChar_x + 140 * scaleFactor,
    gameChar_y + 249 * scaleFactor,
    13 * scaleFactor,
    8 * scaleFactor
  );
  ellipse(
    gameChar_x + 175 * scaleFactor,
    gameChar_y + 249 * scaleFactor,
    13 * scaleFactor,
    8 * scaleFactor
  );
  // Nose
  stroke(250, 128, 114);
  fill(255, 182, 193);
  ellipse(
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 255 * scaleFactor,
    7 * scaleFactor,
    3 * scaleFactor
  );
  // Mouth
  stroke(250, 128, 114);
  strokeWeight(2 * scaleFactor);
  line(
    // Left
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 258 * scaleFactor,
    gameChar_x + 155 * scaleFactor,
    gameChar_y + 262 * scaleFactor
  );
  line(
    // Right
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 258 * scaleFactor,
    gameChar_x + 161 * scaleFactor,
    gameChar_y + 262 * scaleFactor
  );
  // Headpiece
  fill(218, 165, 32);
  stroke(139, 69, 19);
  strokeWeight(2 * scaleFactor);
  rect(
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 218 * scaleFactor,
    10 * scaleFactor,
    24 * scaleFactor,
    10 * scaleFactor
  );
  // Headpiece Decoration
  stroke(139, 69, 19);
  line(
    // 1st
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 225 * scaleFactor,
    gameChar_x + (153 + 10) * scaleFactor,
    gameChar_y + 225 * scaleFactor
  );
  line(
    // 2nd
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 229 * scaleFactor,
    gameChar_x + (153 + 10) * scaleFactor,
    gameChar_y + 229 * scaleFactor
  );
  line(
    // 3rd
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 234 * scaleFactor,
    gameChar_x + (153 + 10) * scaleFactor,
    gameChar_y + 234 * scaleFactor
  );
}

// Walking Right
function drawRightWalking(
  gameChar_x,
  gameChar_y,
  scaleFactor,
  offsetX = -20,
  offsetY = 138
) {
  const baseX = gameChar_x + offsetX;
  const baseY = gameChar_y + offsetY + 17;
  const size = scaleFactor;

  // Head
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 130 * size, baseY - 66 * size, 40 * size, 32 * size, 15 * size);

  // Headpiece
  const earAndHeadpieceOffset = { x: 0, y: 25 }; // Ensure consistent positioning
  stroke(139, 69, 19);
  strokeWeight(8 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(218, 165, 32);
  strokeWeight(4 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(139, 69, 19);
  strokeWeight(1 * size);
  line(
    baseX + (158 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size,
    baseX + (163 + earAndHeadpieceOffset.x) * size,
    baseY + (-89 + earAndHeadpieceOffset.y) * size
  );

  // Ear
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  triangle(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size,
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-102 + earAndHeadpieceOffset.y) * size,
    baseX + (159 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size
  );
  stroke(0);
  strokeWeight(5 * size);
  line(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size,
    baseX + (155 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size
  );

  // Legs
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 139 * size, baseY - 13 * size, 13 * size, 25 * size, 19 * size);
  rect(baseX + 147 * size, baseY - 13 * size, 13 * size, 25 * size, 19 * size);

  // Torso
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 135 * size, baseY - 35 * size, 29 * size, 33 * size, 12 * size);

  // Hands
  rect(baseX + 146 * size, baseY - 27 * size, 10 * size, 20 * size, 18 * size);

  // Neck
  noStroke();
  rect(baseX + 143 * size, baseY - 39 * size, 13 * size, 7 * size);

  // Eye
  fill(176, 238, 238);
  stroke(72, 209, 204);
  strokeWeight(2 * size);
  ellipse(baseX + 165 * size, baseY - 52 * size, 10 * size, 6 * size);

  // Nose and Mouth
  stroke(250, 128, 114);
  fill(250, 128, 114);
  ellipse(baseX + 170 * size, baseY - 46 * size, 4 * size, 3 * size);
  line(
    baseX + 167 * size,
    baseY - 45 * size,
    baseX + 165 * size,
    baseY - 44 * size
  );
}

// Walking Left
function drawLeftWalking(
  gameChar_x,
  gameChar_y,
  scaleFactor,
  offsetX = 165,
  offsetY = 125
) {
  const baseX = gameChar_x + offsetX;
  const baseY = gameChar_y + offsetY + 30;
  const size = scaleFactor;

  const earAndHeadpieceOffset = { x: 0, y: 26 };

  push(); // Save the current transformation state
  translate((gameChar_x + offsetX) * 2, 0); // Shift to the mirrored position
  scale(-1, 1); // Mirror the drawing horizontally

  // Head
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 130 * size, baseY - 66 * size, 40 * size, 32 * size, 15 * size);

  // Headpiece
  stroke(139, 69, 19);
  strokeWeight(8 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(218, 165, 32);
  strokeWeight(4 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(139, 69, 19);
  strokeWeight(1 * size);
  line(
    baseX + (158 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size,
    baseX + (163 + earAndHeadpieceOffset.x) * size,
    baseY + (-89 + earAndHeadpieceOffset.y) * size
  );

  // Ear
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  triangle(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size,
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-102 + earAndHeadpieceOffset.y) * size,
    baseX + (159 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size
  );
  stroke(0);
  strokeWeight(5 * size);
  line(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size,
    baseX + (155 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size
  );

  // Legs
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 139 * size, baseY - 13 * size, 13 * size, 25 * size, 19 * size);
  rect(baseX + 147 * size, baseY - 13 * size, 13 * size, 25 * size, 19 * size);

  // Torso
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 135 * size, baseY - 35 * size, 29 * size, 33 * size, 12 * size);

  // Hands
  rect(baseX + 146 * size, baseY - 27 * size, 10 * size, 20 * size, 18 * size);

  // Neck
  noStroke();
  rect(baseX + 143 * size, baseY - 39 * size, 13 * size, 7 * size);

  // Eye
  fill(176, 238, 238);
  stroke(72, 209, 204);
  strokeWeight(2 * size);
  ellipse(baseX + 165 * size, baseY - 52 * size, 10 * size, 6 * size);

  // Nose and Mouth
  stroke(250, 128, 114);
  fill(250, 128, 114);
  ellipse(baseX + 170 * size, baseY - 46 * size, 4 * size, 3 * size);
  line(
    baseX + 167 * size,
    baseY - 45 * size,
    baseX + 165 * size,
    baseY - 44 * size
  );

  pop(); // Restore the previous transformation state
}

// Jumping Right
function drawJumpingRight(
  gameChar_x,
  gameChar_y,
  scaleFactor,
  offsetX = -20,
  offsetY = 138
) {
  const baseX = gameChar_x + offsetX;
  const baseY = gameChar_y + offsetY + 17;
  const size = scaleFactor;

  const earAndHeadpieceOffset = { x: 1, y: 26 };

  // Head
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 130 * size, baseY - 66 * size, 40 * size, 32 * size, 15 * size);

  // Headpiece
  stroke(139, 69, 19);
  strokeWeight(8 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(218, 165, 32);
  strokeWeight(4 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(139, 69, 19);
  strokeWeight(1 * size);
  line(
    baseX + (158 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size,
    baseX + (163 + earAndHeadpieceOffset.x) * size,
    baseY + (-89 + earAndHeadpieceOffset.y) * size
  );

  // Ear
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  triangle(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size,
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-102 + earAndHeadpieceOffset.y) * size,
    baseX + (159 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size
  );
  stroke(0);
  strokeWeight(5 * size);
  line(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size,
    baseX + (155 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size
  );

  // Legs
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 139 * size, baseY - 13 * size, 13 * size, 25 * size, 19 * size);

  // Leg
  push();
  translate(baseX + 147 * size, baseY - 5 * size);
  rotate(radians(-45));
  rect(0, 0, 13 * size, 25 * size, 19 * size);
  pop();

  // Torso
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 135 * size, baseY - 35 * size, 29 * size, 33 * size, 12 * size);

  // Arm
  push();
  translate(baseX + 158 * size, baseY - 16 * size);
  rotate(radians(-120));
  rect(0, 0, 10 * size, 20 * size, 18 * size);
  pop();

  // Neck
  noStroke();
  rect(baseX + 143 * size, baseY - 39 * size, 13 * size, 7 * size);

  // Eye
  fill(176, 238, 238);
  stroke(72, 209, 204);
  strokeWeight(2 * size);
  ellipse(baseX + 165 * size, baseY - 52 * size, 10 * size, 6 * size);

  // Nose and Mouth
  stroke(250, 128, 114);
  fill(250, 128, 114);
  ellipse(baseX + 170 * size, baseY - 46 * size, 4 * size, 3 * size);
  line(
    baseX + 167 * size,
    baseY - 45 * size,
    baseX + 165 * size,
    baseY - 44 * size
  );
}

// Jumping Left
function drawJumpingLeft(
  gameChar_x,
  gameChar_y,
  scaleFactor,
  offsetX = 165,
  offsetY = 138
) {
  const baseX = gameChar_x + offsetX;
  const baseY = gameChar_y + offsetY + 17;
  const size = scaleFactor;

  const earAndHeadpieceOffset = { x: 0, y: 26 };

  push(); // Save the current transformation state
  translate((gameChar_x + offsetX) * 2, 0); // Shift to mirrored position
  scale(-1, 1); // Mirror the drawing horizontally

  // Head
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 130 * size, baseY - 66 * size, 40 * size, 32 * size, 15 * size);

  // Headpiece
  stroke(139, 69, 19);
  strokeWeight(8 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(218, 165, 32);
  strokeWeight(4 * size);
  line(
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-93 + earAndHeadpieceOffset.y) * size,
    baseX + (165 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size
  );
  stroke(139, 69, 19);
  strokeWeight(1 * size);
  line(
    baseX + (158 + earAndHeadpieceOffset.x) * size,
    baseY + (-84 + earAndHeadpieceOffset.y) * size,
    baseX + (163 + earAndHeadpieceOffset.x) * size,
    baseY + (-89 + earAndHeadpieceOffset.y) * size
  );

  // Ear
  fill(0);
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  triangle(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size,
    baseX + (151 + earAndHeadpieceOffset.x) * size,
    baseY + (-102 + earAndHeadpieceOffset.y) * size,
    baseX + (159 + earAndHeadpieceOffset.x) * size,
    baseY + (-87 + earAndHeadpieceOffset.y) * size
  );
  stroke(0);
  strokeWeight(5 * size);
  line(
    baseX + (141 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size,
    baseX + (155 + earAndHeadpieceOffset.x) * size,
    baseY + (-86 + earAndHeadpieceOffset.y) * size
  );

  // Legs
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 139 * size, baseY - 13 * size, 13 * size, 25 * size, 19 * size);

  // Leg
  push();
  translate(baseX + 147 * size, baseY - 5 * size);
  rotate(radians(-45));
  rect(0, 0, 13 * size, 25 * size, 19 * size);
  pop();

  // Torso
  stroke(139, 69, 19);
  strokeWeight(3 * size);
  rect(baseX + 135 * size, baseY - 35 * size, 29 * size, 33 * size, 12 * size);

  // Arm
  push();
  translate(baseX + 158 * size, baseY - 16 * size);
  rotate(radians(-120));
  rect(0, 0, 10 * size, 20 * size, 18 * size);
  pop();

  // Neck
  noStroke();
  rect(baseX + 143 * size, baseY - 39 * size, 13 * size, 7 * size);

  // Eye
  fill(176, 238, 238);
  stroke(72, 209, 204);
  strokeWeight(2 * size);
  ellipse(baseX + 165 * size, baseY - 52 * size, 10 * size, 6 * size);

  // Nose and Mouth
  stroke(250, 128, 114);
  fill(250, 128, 114);
  ellipse(baseX + 170 * size, baseY - 46 * size, 4 * size, 3 * size);
  line(
    baseX + 167 * size,
    baseY - 45 * size,
    baseX + 165 * size,
    baseY - 44 * size
  );

  pop(); // Restore the previous transformation state
}

// Jumping Front Facing
function drawJumpingFacingFroward(gameChar_x, gameChar_y, scaleFactor) {
  // Ears
  fill(0);
  stroke(139, 69, 19);
  triangle(
    gameChar_x + 130 * scaleFactor,
    gameChar_y + 256 * scaleFactor,
    gameChar_x + 150 * scaleFactor,
    gameChar_y + 231 * scaleFactor,
    gameChar_x + 136 * scaleFactor,
    gameChar_y + 217 * scaleFactor
  );
  triangle(
    gameChar_x + 160 * scaleFactor,
    gameChar_y + 235 * scaleFactor,
    gameChar_x + 177 * scaleFactor,
    gameChar_y + 217 * scaleFactor,
    gameChar_x + 180 * scaleFactor,
    gameChar_y + 234 * scaleFactor
  );
  // Head
  fill(0);
  stroke(139, 69, 19);
  rect(
    gameChar_x + 124 * scaleFactor,
    gameChar_y + 230 * scaleFactor,
    65 * scaleFactor,
    47 * scaleFactor,
    20 * scaleFactor
  );
  // Hands
  fill(0);
  stroke(139, 69, 19);

  // Left Hand
  push();
  translate(gameChar_x + 190 * scaleFactor, gameChar_y + 300 * scaleFactor); // Move to left hand position
  rotate(radians(-140)); // Rotate left hand by -30 degrees
  rect(0, 0, 15 * scaleFactor, 30 * scaleFactor, 10 * scaleFactor); // Draw the left hand
  pop();

  // Right Hand
  push();
  translate(gameChar_x + 106 * scaleFactor, gameChar_y + 279 * scaleFactor); // Move to right hand position
  rotate(radians(-44)); // Rotate right hand by -30 degrees (same direction as left hand)
  rect(0, 0, 15 * scaleFactor, 30 * scaleFactor, 10 * scaleFactor); // Draw the right hand
  pop();

  // Legs
  fill(0);
  stroke(139, 69, 19);

  // Left Leg
  push();
  translate(gameChar_x + 161 * scaleFactor, gameChar_y + 317 * scaleFactor); // Move to right leg position
  rotate(radians(-30)); // Rotate the right leg
  rect(0, 0, 17 * scaleFactor, 30 * scaleFactor, 10 * scaleFactor); // Draw the right leg
  pop();

  // Right Leg
  push();
  translate(gameChar_x + 140 * scaleFactor, gameChar_y + 310 * scaleFactor); // Move to left leg position
  rotate(radians(20)); // Rotate the left leg
  rect(0, 0, 17 * scaleFactor, 30 * scaleFactor, 10 * scaleFactor); // Draw the left leg
  pop();

  // Torso
  fill(0);
  rect(
    gameChar_x + 133 * scaleFactor,
    gameChar_y + 278 * scaleFactor,
    50 * scaleFactor,
    40 * scaleFactor,
    15 * scaleFactor
  );
  noStroke();
  rect(
    gameChar_x + 144 * scaleFactor,
    gameChar_y + 272 * scaleFactor,
    25 * scaleFactor,
    35 * scaleFactor
  );
  // Eyes
  fill(175, 238, 238);
  stroke(72, 209, 204);
  ellipse(
    gameChar_x + 140 * scaleFactor,
    gameChar_y + 249 * scaleFactor,
    13 * scaleFactor,
    8 * scaleFactor
  );
  ellipse(
    gameChar_x + 175 * scaleFactor,
    gameChar_y + 249 * scaleFactor,
    13 * scaleFactor,
    8 * scaleFactor
  );
  // Nose
  stroke(250, 128, 114);
  fill(255, 182, 193);
  ellipse(
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 255 * scaleFactor,
    7 * scaleFactor,
    3 * scaleFactor
  );
  // Mouth
  stroke(250, 128, 114);
  strokeWeight(2 * scaleFactor);
  line(
    // Left
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 258 * scaleFactor,
    gameChar_x + 155 * scaleFactor,
    gameChar_y + 262 * scaleFactor
  );
  line(
    // Right
    gameChar_x + 158 * scaleFactor,
    gameChar_y + 258 * scaleFactor,
    gameChar_x + 161 * scaleFactor,
    gameChar_y + 262 * scaleFactor
  );
  // Headpiece
  fill(218, 165, 32);
  stroke(139, 69, 19);
  strokeWeight(2 * scaleFactor);
  rect(
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 218 * scaleFactor,
    10 * scaleFactor,
    24 * scaleFactor,
    10 * scaleFactor
  );
  // Headpiece Decoration
  stroke(139, 69, 19);
  line(
    // 1st
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 225 * scaleFactor,
    gameChar_x + (153 + 10) * scaleFactor,
    gameChar_y + 225 * scaleFactor
  );
  line(
    // 2nd
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 229 * scaleFactor,
    gameChar_x + (153 + 10) * scaleFactor,
    gameChar_y + 229 * scaleFactor
  );
  line(
    // 3rd
    gameChar_x + 153 * scaleFactor,
    gameChar_y + 234 * scaleFactor,
    gameChar_x + (153 + 10) * scaleFactor,
    gameChar_y + 234 * scaleFactor
  );
}
// Enemy
function Enemy(x, y, size, speed) {
  this.x = x;
  this.y = y;
  this.size = size;
  this.speed = speed;

  this.display = function () {
    image(enemyImg, this.x, this.y - this.size, this.size, this.size);
  };

  this.checkCollision = function (charX, charY) {
    let charBoxX = charX + 85;
    let charBoxY = charY + 10;
    let charWidth = 50;
    let charHeight = 60;

    let enemyBoxX = this.x - cameraPos_x;
    let enemyBoxY = this.y - 50;
    let enemyWidth = 50;
    let enemyHeight = 50;

    if (
      charBoxX < enemyBoxX + enemyWidth &&
      charBoxX + charWidth > enemyBoxX &&
      charBoxY < enemyBoxY + enemyHeight &&
      charBoxY + charHeight > enemyBoxY
    ) {
      console.log("Collision Detected!");

      if (lives > 0) {
        lives--; // Reduce life
        meowSound.play();

        if (lives > 0) {
          resetGame(); // Reset game if lives remain
        }
      }
    }
  };
}

function resetGame() {
  gameChar_x = 200;
  gameChar_y = groundLevel;
  isPlummeting = false;
  velocity_y = 0;
  score = 0;

  // Reset collectables (mark them as not found instead of redefining the array)
  collectables.forEach((c) => (c.isFound = false));

  // Reset enemies (reposition instead of recreating)
  enemies.forEach((enemy, i) => {
    let x1 = canyon[i].x;
    let x2 = canyon[i + 1]?.x || x1 + 200;
    enemy.x = (x1 + x2) / 2;
    enemy.y = groundLevel + 175;
  });
}

// Winning function
function showWinScreen() {
  if (!winVideo.elt.playing) {
    winVideo.loop(); // Loop the video
    winVideo.volume(0.5); // Adjust volume
    winVideo.play();
  }

  // Draw the video
  image(winVideo, 0, 0, width, height);

  // Overlay "Winner" text
  textSize(100);
  textAlign(CENTER, CENTER);
  stroke(0);
  strokeWeight(5);
  fill(random(255), random(255), random(255));
  textFont(font);
  text("Winner", width / 2, height / 2);

  if (bgMusic.isPlaying()) {
    bgMusic.stop(); // Stop background music
  }

  if (!winSound.isPlaying()) {
    winSound.play(); // Play victory sound
  }

  if (frameCount % 700 === 0) {
    noLoop();
  }
}

// Game Over function
function handleGameOver() {
  console.log("Game Over: No lives left!");

  if (bgMusic.isPlaying()) {
    bgMusic.stop(); // Stop background music before playing Game Over sound
  }

  if (!gameOverSound.isPlaying()) {
    gameOverSound.play();
  }

  // Game Over text
  textFont(font);
  textSize(100);
  textAlign(CENTER, CENTER);
  stroke(0);
  strokeWeight(2);
  fill(230, 230, 0);
  text("Game Over", width / 2, height / 2);

  // DO NOT return; let draw() keep running for background
  noLoop(); // Stops player movement but keeps background visible
}

function keyPressed() {
  if (keyCode == 37) {
    isLeft = true;
  }
  if (keyCode == 39) {
    isRight = true;
  }
  if (keyCode == 32 && isOnGround && !isJumping) {
    // Prevents double jump
    isJumping = true;
    velocity_y = jumpStrength;
    isOnGround = false;
    jumpSound.play();
  }
}

function keyReleased() {
  console.log("keyReleased: " + key);
  console.log("keyReleased: " + keyCode);

  if (keyCode == 37) {
    console.log("left arrow released");
    isLeft = false;
  }
  if (keyCode == 39) {
    console.log("right arrow released");
    isRight = false;
  }
}
