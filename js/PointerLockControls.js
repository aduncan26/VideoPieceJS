/**
 * @author mrdoob / http://mrdoob.com/
 */


THREE.PointerLockControls = function ( camera, scene, globeControls ) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );
    
	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );
    scene.add(pitchObject);
    
    
    document.addEventListener('click', function lockPointer(event){
        var element = document.body;
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
        scope.enabled = true;
    }, false);
    
    document.addEventListener('pointerlockchange', function(event){
        if(document.pointerLockElement !== document.body &&
           document.mozPointerLockElement !== document.body && 
           document.webkitRequestPointerLock !== document.body){
            scope.enabled = false;
        }
    }, false);


    var yawObject;
	yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );
    scene.add(yawObject);
    
    var centerObj;
    if(globeControls){
        centerObj = new THREE.Object3D();
        centerObj.add(yawObject);
        yawObject.position.y = -99.9;
        scene.add(centerObj);
    }
        

	var PI_2 = Math.PI / 2;
    
    var moveForward;
    var moveBackward;
    var moveLeft;
    var moveRight;
    
    var vector = new THREE.Vector3();
    var worldUp = new THREE.Vector3(0,1,0);
    var speedVector = new THREE.Vector3();
    var speed = 50;

	var onMouseMove = function ( event ) {
        
		if ( scope.enabled === false ) return;
        
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.001;
		pitchObject.rotation.x -= movementY * 0.001;
        
		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );

	};

	document.addEventListener( 'mousemove', onMouseMove, false );

	this.enabled = false;

    function keyDown(event){
        switch(event.keyCode){
            case 87:
                moveForward = true;
                break;  
            case 83:
                moveBackward = true;
                break;
            case 65:
                moveLeft = true;
                break;
            case 68:
                moveRight = true;
                break;
        }
    }

    function keyUp(event){
        switch(event.keyCode){
            case 87:
                moveForward = false;
                break;
            case 83:
                moveBackward = false;
                break;
            case 65:
                moveLeft = false;
                break;
            case 68:
                moveRight = false;
                break;
        } 
    }

    document.addEventListener('keydown', function(event){keyDown(event)}, false);
    document.addEventListener('keyup', function(event){keyUp(event)}, false);

    this.vidUpdate = function(deltaTime){
        camera.getWorldDirection(vector);
                
        var crossProd = new THREE.Vector3();
        crossProd.crossVectors(vector, worldUp);

        //Prevent the direction of the camera from effecting
        //up and down directions
        vector.y = 0;
        crossProd.y = 0;
        
        speedVector.set(speed * deltaTime, speed * deltaTime, speed * deltaTime);

        vector.normalize();
        crossProd.normalize();
        
        vector.multiply(speedVector);
        crossProd.multiply(speedVector);

        if(moveForward){
            yawObject.position.addVectors(yawObject.position, vector);
        }
        if(moveBackward){
            yawObject.position.addVectors(yawObject.position, vector.negate());
        }
        if(moveLeft){
            yawObject.position.addVectors(yawObject.position, crossProd.negate());
        }
        if(moveRight){
            yawObject.position.addVectors(yawObject.position, crossProd);
        }
        
        yawObject.position.y = globalNoise.noise(yawObject.position.x, yawObject.position.z) + 10;
    }
    
    this.globeUpdate = function(deltaTime){
        if(moveForward){
            centerObj.rotation.x += 0.1 * deltaTime;
        }
        if(moveBackward){
//            yawObject.position.addVectors(yawObject.position, vector.negate());
        }
        if(moveLeft){
//            yawObject.position.addVectors(yawObject.position, crossProd.negate());
        }
        if(moveRight){
//            yawObject.position.addVectors(yawObject.position, crossProd);
        }
    }
    
	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

};