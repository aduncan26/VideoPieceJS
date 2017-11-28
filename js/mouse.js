var Mouse = function(scene, x, y, z, geo, mat, matHeight){  
  var obj;
  var childObj;
  var velocity; 
    
  var target = null;
    
  var acceleration;
  var r;
  
  //TUNING VARIABLES
  //Speeds
  var rMaxS = 50;
  var rMinS = 40;
  var rMaxF = 2;
  var rMinF = 1.7;

  //Multipliers
  var seekMult = 1;
  var fleeMult = 3;

  //Detection ranges
  var fleeRange = 50;
  
  var maxspeed = rMinS;    // Maximum speed
  var maxforce = rMinF;    // Maximum steering force
  var defaultSpeed = rMinS + Math.random() * (rMaxS - rMinS);
  var defaultForce = rMinF + Math.random() * (rMaxF - rMinF);

  var initialized = false;
    
  var worldX = 1100;
  var worldY = 900;
  var worldZ = 1100;
    
  var worldForward = new THREE.Vector3(0,0,1);
    
  var height;
  
  function init() {
    acceleration = new THREE.Vector3(0, 0, 0);
    velocity = new THREE.Vector3();
    let pos = new THREE.Vector3(x, y, z);
    r = 5.0;
    
    childObj = new THREE.Mesh(geo, mat);
    scene.add(childObj);

    obj = new THREE.Object3D();
    obj.position.set(pos.x, pos.y, pos.z);
    scene.add(obj);

    obj.add(childObj);
    childObj.position.set(0,0,0);
    
    height = matHeight;
            
    initialized = true;
  }
    
  this.run = function() { 
    if(!initialized)
        return;
      
    update();
    render();
  }
    
  // Method to update position
  function update() {
    maxspeed = defaultSpeed * deltaTime * globalSpeed;
    maxforce = defaultForce * deltaTime  * globalSpeed;
    
    noiseTargetTrigger();
      
    if(target !== null){
        applyForce(seek(target));
        
        if(obj.position.distanceToSquared(target) < 1){
            velocity.multiplyScalar(0);
            acceleration.multiplyScalar(0);
            obj.position.set(target.x, target.y, target.z);
            target = null;
        }
    }
    // Update velocity
    velocity.add(acceleration);
    // Limit speed
    velocity.clampLength(0, maxspeed);
    obj.position.add(velocity);
    obj.position.y = globalNoise.noise(obj.position.x, obj.position.z) + height/2;
      
    
    // Reset accelertion to 0 each cycle
    acceleration.multiplyScalar(0);
  }
    
  function render() {
    // Draw a triangle rotated in the direction of velocity
    obj.position.add(velocity);
      
    if(!tween && target !== null){
        childObj.lookAt(velocity);
    }
  }

  var randStart = Math.random() * 5000;
  function noiseTargetTrigger(){
      let noise = globalNoise.noise(randStart, timer * 1000, false);
      
      if(noise > 0.6 && target === null){
          makeTarget();
      }
      console.log(noise);
      
  }
    
  function applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }
    
  function makeTarget(){
      let minDist = 50;
      let maxDist = 150;
      
      let randX = (Math.random() - 0.5) * 2;
      let randZ = (Math.random() - 0.5) * 2;
      
      //now that it's between 0 and 1, let's set a vector and make its magnitude between min and max
      target = new THREE.Vector3(randX, 0, randZ);
      
      let mag = minDist + Math.random() * (maxDist - minDist);
      
      target.normalize();
      target.multiplyScalar(mag);
            
      target.y = globalNoise.noise(target.x, target.z) + height/2;
      console.log(target);
  }
    
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  function seek(yourTarget) {
    let desired = new THREE.Vector3(yourTarget.x - obj.position.x, yourTarget.y - obj.position.y, yourTarget.z - obj.position.z); // A vector pointing from the position to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(maxspeed);
    // Steering = Desired minus Velocity
    var steer = new THREE.Vector3(desired.x - velocity.x, desired.y - velocity.y, desired.z - velocity.z);
    steer.clampLength(0, maxforce);  // Limit to maximum steering force
    return steer;
  }
    
  
  var runToHole = null;
    
  function flee(fox, holes){
      let retValue = new THREE.Vector3(0,0,0);
      
      let foxDist = fox.position.distanceTo(obj.position);
      
      if(foxDist < fleeRange){
         let closestHole = new THREE.Vector3();
         let minDist = 100000;
          
         for(var i = 0; i < holes.Length; i++){
              let d = holes[i].distanceTo(obj.position);
              if(d < minDist){
                  closestHole = holes[i];
                  minDist = d;
              }
          }
          
          let holeDesired = new THREE.Vector3();
          holeDesired.subVectors(closestHole, obj.position);
      }
      
      return retValue;
      
  }
  init();
    
}