var Boid = function(scene, x, y, z, geo, mat) {
  var obj;
  var velocity;
    
  var acceleration;
  var r;
  
  //TUNING VARIABLES
  //Speeds
  var rMaxS = 170;
  var rMinS = 130;
  var rMaxF = 1;
  var rMinF = 0.5;

  //Multipliers
  var sepMult = 1.5;
  var aliMult = 1.5;
  var cohMult = 0.8;
  var randMult = 0.3;
  var boundsMult = 10;

  //Detection ranges
  var sepRange = 50;
  var aliRange = 200;
  var cohRange = 200;
    
  var minY = 100;
  var sineCutoff = 0.5;
  
  var maxspeed = rMinS;    // Maximum speed
  var maxforce = rMinF;    // Maximum steering force
  var defaultSpeed = rMinS + Math.random() * (rMaxS - rMinS);
  var defaultForce = rMinF + Math.random() * (rMaxF - rMinF);

  var initialized = false;
    
  var worldX = 1200;
  var worldY = 900;
  var worldZ = 1200;
    
  var worldForward = new THREE.Vector3(0,0,1);
  
  function init() {
    acceleration = new THREE.Vector3(0, 0, 0);
    velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    velocity.multiplyScalar(maxspeed);
    let pos = new THREE.Vector3(x, y, z);
    r = 5.0;
      
    obj = new THREE.Mesh(geo, mat);
    obj.position.set(pos.x, pos.y, pos.z);
      
    initialized = true;
  }

  this.run = function() { 
    if(!initialized)
        return;
      
    update();
//    borders();
    render();
  }
    
  this.getObj = function(){
      return obj;
  }
  this.getVelocity = function(){
      return velocity;
  }

  function applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  this.flock = function(boids) {
    let sep = separate(boids);   // Separation
    let ali = align(boids);      // Alignment
    let coh = cohesion(boids);   // Cohesion
    let bounds = turnToCenter();
    let rand = randomForce();
      
    // Not for every boid yet
    // PVector view = view(boids);      // view

    // Arbitrarily weight these forces
    let sMult = sepMult + Math.max(sineCutoff, sepSine) * 2 - (sineCutoff * 2);  
    let aMult = aliMult - Math.max(sineCutoff, sepSine) * 1 + (sineCutoff * 1);
    let cMult = cohMult - Math.max(sineCutoff, sepSine) * 1 + (sineCutoff * 1);
      
    sep.multiplyScalar(sMult);
    ali.multiplyScalar(aMult);
    coh.multiplyScalar(cMult);
    bounds.multiplyScalar(boundsMult);
    rand.multiplyScalar(randMult);

    // Not for every boid yet
    // view.mult(1.0);

    // Add the force vectors to acceleration
    applyForce(sep);
    applyForce(ali);
    applyForce(coh);
    applyForce(bounds);
    applyForce(rand);

    // Not for every boid yet
    // applyForce(view);
  }
  
  // Method to update position
  function update() {
    maxspeed = defaultSpeed * deltaTime * globalSpeed;
    maxforce = defaultForce * deltaTime  * globalSpeed;
    // Update velocity
    velocity.add(acceleration);
    // Limit speed
    velocity.clampLength(0, maxspeed);
    obj.position.add(velocity);
    // Reset accelertion to 0 each cycle
    acceleration.multiplyScalar(0);
  }
    
  function randomForce(){
      let randDir = new THREE.Vector3( (Math.random() - 0.5) * 5 - obj.position.x,
                                     (Math.random() - 0.5) * 5 - obj.position.y,
                                     (Math.random() - 0.5) * 5 - obj.position.z);
      randDir.normalize();
      randDir.multiplyScalar(maxspeed);
      randDir.sub(velocity);
      randDir.clampLength(0, maxforce);
      return randDir;
      
  }
  
  function outOfBounds(){
      if(Math.abs(obj.position.x + velocity.x) > worldX){
          return true;
      }
      if(obj.position.y + velocity.y > worldY || 
         obj.position.y + velocity.y < minY + globalNoise.noise(obj.position.x, obj.position.z)){
          return true;
      }
      if(Math.abs(obj.position.z + velocity.z) > worldZ){
          return true;
      }
      return false;
  }
    
  function turnToCenter(){
      if(outOfBounds()){
          let target = new THREE.Vector3(0 - obj.position.x, (worldY - minY)/2 - obj.position.y, 0 - obj.position.z);
          
          let force = new THREE.Vector3(target.x - velocity.x, target.y - velocity.y, target.z - velocity.z);//velocity.reflect(obj.up.applyQuaternion(obj.quaternion));
          force.normalize();
          force.multiplyScalar(maxforce);
          return force;
      } else{
          return new THREE.Vector3(0,0,0);
      }
  }

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  function seek(target) {
    let desired = new THREE.Vector3(target.x - obj.position.x, target.y - obj.position.y, target.z - obj.position.z); // A vector pointing from the position to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(maxspeed);
    // Steering = Desired minus Velocity
    var steer = new THREE.Vector3(desired.x - velocity.x, desired.y - velocity.y, desired.z - velocity.z);
    steer.clampLength(0, maxforce);  // Limit to maximum steering force
    return steer;
  }
    
  function render() {
    // Draw a triangle rotated in the direction of velocity
    obj.position.add(velocity);
      
    if(!tween){
        var facing = new THREE.Vector3(obj.position.x + velocity.x, obj.position.y + velocity.y, obj.position.z + velocity.z);

        obj.lookAt(facing);
    }
    //Do this only if it is a plane
//    obj.rotation.y += Math.PI/2;
  }

  // Separation
  // Method checks for nearby boids and steers away
  function separate (boids) {
    let currentSep = Math.max(sineCutoff, sepSine) * 200 + sepRange - (200 * sineCutoff);
    let desiredseparation = currentSep;
    let steer = new THREE.Vector3();
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let other = boids[i].getObj();
        let diff = new THREE.Vector3(obj.position.x - other.position.x, obj.position.y - other.position.y, obj.position.z - other.position.z);
        diff.normalize();
        diff.divideScalar(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.divideScalar(count);
    }

    // As long as the vector is greater than 0
    if (steer.length() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.multiplyScalar(maxspeed);
      steer.sub(velocity);
      steer.clampLength(0, maxforce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  function align (boids) {
    let neighbordist = aliRange;
    let sum = new THREE.Vector3();
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].getVelocity());
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(maxspeed);
      let steer = new THREE.Vector3(sum.x - velocity.x, sum.y - velocity.y, sum.z - velocity.z);
      steer.clampLength(0, maxforce);
      return steer;
    } 
    else {
      return new THREE.Vector3(0,0,0);
    }
  }

  // Cohesion
  // For the average position (i.e. center) of all nearby boids, calculate steering vector towards that position
  function cohesion (boids) {
    let neighbordist = cohRange;
    let sum = new THREE.Vector3();   // Start with empty vector to accumulate all positions
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].getObj().position);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      return seek(sum);  // Steer towards the position
    } 
    else {
      return new THREE.Vector3(0, 0, 0);
    }
  }
    
    init();
}