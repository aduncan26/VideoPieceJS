var Animal = function(type, width, height, depth){
    
    Animal.prototype.updateFunction = function(){
        hareUpdate();
    }
    
    function init(){
        switch(type){
            case "hare":
                initHare();
                updateFunction = hareUpdate;
                break;
            case "coyote":
                initCoyote();
                updateFunction = coyoteUpdate;
                break;
            case "sparrow":
                initSparrow();
                updateFunction = sparrowUpdate;
                break;
            default:
                updateFunction = null;
                break;
        }
    }
    
    var desired = new THREE.Vector3();
    var velocity  = new THREE.Vector3();
    var force = new THREE.Vector3();
    var worldForward = new THREE.Vector3(0, 0, 1);
    
    var obj;
    
    var animalNoise = new SimplexNoise();
        
    function globalInit(){
        var geometry = new THREE.BoxGeometry(width, height, depth);
        var material = new THREE.MeshBasicMaterial({color:0xffffff});
        obj = new THREE.Mesh(geometry, material);
        vidScene.add(obj);
    }
    
    //HARE
    function initHare(){
        globalInit();
        
        this.maxSpeed = 10 + Math.random() * (2);
        this.maxForce = 2 + Math.random() * (0.5);
        
        
    }
    
    function hareGetForce(){
        var forwardVec = worldForward;
        forwardVec.applyQuaternion(obj.quaternion);
        
        var forwardAmount = animalNoise.noise(0.5, clock.elapsedTime);
        
        if(forwardAmount < 0.5)
            return;
        
        var x = Math.random() - 0.5;
        var z = Math.random() - 0.5;
        
        var randDir = new THREE.Vector3(x, 0, z);
        
        desired.add(randDir);
        
        desired.clampLength(0, maxForce);
                
        force.subVectors(desired, velocty);
        
                console.log(desired);

    }
    
    function hareUpdate(){

        hareGetForce();
        
        velocity.clampLength(0, maxSpeed);
        
        velocity.add(force)
        obj.position.add(velocity);
        obj.position.y = globalNoise.noise(obj.position.x, obj.position.z);
    }
      
    //COYOTE
    function initCoyote(){
        this.maxSpeed = 12 + Math.random() * 2;
        this.maxForce = 1 + Math.random() * 0.5;
        
    }
    
    function coyoteUpdate(){
        
    }
    
    //SPARROW
    function initSparrw(){
        this.maxSpeed = 12 + Math.random() * 2;
        this.maxForce = 0.1 + Math.random() * 0.1;
    }
    
    function sparrowUpdate(){
        
    }
    
    init();
    
}