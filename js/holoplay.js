//Copyright 2017 Looking Glass Factory Inc.
//All rights reserved.
//Unauthorized copying or distribution of this file, and the source code contained herein, is strictly prohibited.

function HoloPlay(scene, camera, renderer, viewCount, viewAngle, focalPointVector){
    //This makes sure we don't try to render before initializing
    var intialized = false;
    
    //render texture dimensions
    const renderSizeX = 512;
    const renderSizeY = 256;
    
    function init()
    {
        this.threeD = true;
        this.jsonObj = null;
        
        if(viewCount === undefined)
            viewCount = 32;
        if(focalPointVector === undefined){
            var vector = new THREE.Vector3();
            var defaultScale = 10;
            camera.getWorldDirection(vector);
            vector.multiplyScalar(defaultScale);
            focalPointVector = [vector.x, vector.y, vector.z];
        }
        if(viewAngle === undefined)
            viewAngle = 47.5;
        
        this._renderer = renderer;
        this._camera = camera;
        this._scene = scene;
                
        this.center = new THREE.Vector3(focalPointVector[0], focalPointVector[1], focalPointVector[2]);
        
        //Stores the position of the center in relation to the camera
        //Let's us change the rotation or position of the camera and still have it work
        //Change this in order to change the focus of the camera after runtime
        this.viewScale = center.distanceTo(camera.position);
        this.cameraForward = new THREE.Vector3();
        camera.getWorldDirection(cameraForward);
        
        //Capture settings
        this.numViews = viewCount;
        this.viewCone = viewAngle;

        //Init intermediate render textures
        this.smallRenderTargets = new Array(numViews);
        this.planes = new Array(numViews);
        this.planeMats = new Array(numViews);
        
        //Buffer scene
        this.bufferScene = new THREE.Scene();
        this.bufferCam = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 3);
        bufferCam.position.z = 2;
        bufferScene.add(bufferCam);
        this.bufferSceneRender = new THREE.WebGLRenderTarget(2048, 2048, {format: THREE.RGBFormat});
        
        //Init shader uniforms
        var uniforms = 
        {
            quiltTexture: {value: bufferSceneRender.texture},
            pitch: {value: 0},
            tilt: {value: 0},
            center: {value: 0},
            numViews: {value: 0},
            tilesX: {value: 0},
            tilesY: {value: 0},
            screenW: {value: 0},
            screenH: {value: 0},
            windowW: {value: 0},
            windowH: {value: 0},
            windowX: {value: 0},
            windowY: {value: 0}
        };

        //Set up the shader
        var shaderProperties = {
            uniforms: uniforms,
            vertexShader: VertexShaderCode, 
            fragmentShader: FragmentShaderCode
        };

        //Apply the shader to the buffer material
        this.bufferMat = new THREE.ShaderMaterial(shaderProperties);

        //Set up the final render scene
        this.finalRenderScene = new THREE.Scene();
        this.renderPlaneGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
        
        this.renderPlane = new THREE.Mesh(renderPlaneGeometry, bufferMat);
        finalRenderScene.add(renderPlane);
        
        this.finalRenderCamera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 1, 3);
        finalRenderCamera.position.z = 2;
        finalRenderScene.add(finalRenderCamera);
        
        //Initialize up the 32 planes for the buffer scene
        setBufferScene();
        
        //Set up the shader for the holoplayer config with default values
        setShaderValues(338.0, 49.89741516113281, 5.622990608215332, 1600.0, 2560.0, -0.5296876430511475);
        
        //Add the user buttons
        setupFileSelectionButton();
        setupFullScreen();
                
        initialized = true;
    };
    
    //******HTML SETUP******//
    
    //Create the dom element for the fullscreen button
    function makeFullScreenButton(){
        var newHTML = 
            '<input type="button" style="margin:20px; position:fixed; top:0px; right:0px; z-index: 10000; height:50px; width:150px;" id="fullscreenButton" value="Enter Full Screen Mode"/>';
        
        var buttonDiv = document.createElement("div");
        
        buttonDiv.innerHTML = newHTML;
        
        buttonDiv.setAttribute("id", "fullscreen");
        
        document.body.appendChild(buttonDiv);
    };
    
    //Adding the functionality for the fullscreen button
    function setupFullScreen(){
        makeFullScreenButton();
        
        document.getElementById('fullscreen').addEventListener("click", function(){
            if(_renderer.domElement.requestFullscreen) {
                _renderer.domElement.requestFullscreen();
            } else if(_renderer.domElement.mozRequestFullScreen) {
                _renderer.domElement.mozRequestFullScreen();
            } else if(_renderer.domElement.webkitRequestFullscreen) {
                _renderer.domElement.webkitRequestFullscreen();
            } else if(_renderer.msRequestFullscreen) {
                _renderer.domElement.msRequestFullscreen();
            }
        });
    };
    
    //Setup the dom element for the file selection button
    function setupFileSelectionButton(){
        
        var showButton = true;
        
        var storedValue = localStorage['Config'];

        if(storedValue){
            jsonObj = JSON.parse(storedValue);
                
            setShaderValues(jsonObj.DPI.value, jsonObj.pitch.value, jsonObj.slope.value, jsonObj.screenH.value, jsonObj.screenW.value, jsonObj.center.value);
            
            showButton = false;
        };
        
        var newHTML = 
            '<div id="jsonInput" style="margin:20px; position:fixed; top:50px; right:0px; z-index: 10000; height:50px; width:150;" >'
            + '<input type="button" id="loadJSON" value="Load HoloPlay Configuration JSON" />'
            + '<input type="file" style="display:none;" id="file" name="file"/></div>';
        
        var fileButtonDiv = document.createElement("div");
        
        fileButtonDiv.innerHTML = newHTML;
        
        document.body.appendChild(fileButtonDiv);
        
        document.getElementById('file').addEventListener('change', handleFileSelect, false);
        
        //Syncing the functionality of the button to the hidden file object
        document.getElementById('loadJSON').addEventListener("click", function(){document.getElementById('file').click()});

        //Don't show the button if we already have a JSON cached
        //Need to have the html in the document though to have the reset work
        if(!showButton){
            fileButtonDiv.style = "display:none";
        }
    };
    
    //Add a listener to change the config file
    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        if(files[0].type !== "application/json"){
            alert("Selected file is not a JSON file!");
            return;
        };

        var fileReader = new FileReader();
        fileReader.onload = function(evt){  
            jsonObj = JSON.parse(evt.target.result);

            setShaderValues(jsonObj.DPI.value, jsonObj.pitch.value, jsonObj.slope.value, jsonObj.screenH.value, jsonObj.screenW.value, jsonObj.center.value);

            document.getElementById("jsonInput").setAttribute("STYLE", "display:none");// = "display:none"; 
            
            localStorage['Config'] = evt.target.result;
        };

        fileReader.readAsText(files[0]);

    };
    
    //*******SHADER SETUP******//
    
    //Set up the buffer scene
    function setBufferScene(){
        var planeX = window.innerWidth/4;
        var planeY = window.innerHeight/8;
        var startX = -window.innerWidth/2 + planeX/2;
        var startY = -window.innerHeight/2 + planeY/2;
        var planeGeometry = new THREE.PlaneBufferGeometry(planeX, planeY);

        var planeIndex = 0;
        
        for(var i = 0; i < numViews; i++){
            planeMats[i] = new THREE.MeshBasicMaterial(0x000000);
            smallRenderTargets[i] = new THREE.WebGLRenderTarget(renderSizeX, renderSizeY, {format: THREE.RGBFormat});
            planeMats[i].map = smallRenderTargets[i].texture;
        }
        
        //We will always have 4 x 8 grid
        //even if numViews is less than 32
        for(var i = 0; i < 8; i++){
            for(var j = 0; j < 4; j++){
                if(planeIndex >= numViews)
                    break;
                planes[planeIndex] = new THREE.Mesh(planeGeometry, planeMats[planeIndex]);
                planes[planeIndex].position.set(startX + planeX * j, startY + planeY * i, 0);
                bufferScene.add(planes[planeIndex]);
                planeIndex++;
            };
        };
    };
    
    function setShaderValues(dpi, pitch, slope, screenH, screenW, center)
    {
        // var screenInches = window.innerWidth / dpi;
        // var newPitch = pitch * screenInches;
        var screenInches = screenW / dpi;
        var newPitch = pitch * screenInches;
        
        //account for tilt in measuring pitch horizontally
        newPitch *= Math.cos(Math.atan(1.0 / slope));
        bufferMat.uniforms.pitch.value = newPitch;
                
        //tilt
        var newTilt = screenH / (screenW * slope);
        bufferMat.uniforms.tilt.value = newTilt;
        
        //screen width and height
        bufferMat.uniforms.screenW.value = screenW;
        bufferMat.uniforms.screenH.value = screenH;
        //screen width and height
        bufferMat.uniforms.windowW.value = window.innerWidth;
        bufferMat.uniforms.windowH.value = window.innerHeight;
        //screen width and height
        bufferMat.uniforms.windowX.value = window.screenX;
        bufferMat.uniforms.windowY.value = window.screenY;
        
        //center
        bufferMat.uniforms.center.value = center;

        //numver of views
        bufferMat.uniforms.numViews.value = numViews;

        //tiles
        var tilesX = 4;
        var tilesY = 8;
        bufferMat.uniforms.tilesX.value = tilesX;
        bufferMat.uniforms.tilesY.value = tilesY;

        bufferMat.needsUpdate = true;
    };
    
    //*******LOGIC FOR CAPTURING MULTIPLE VIEWS******//

    //Render the different views
    function captureViews(scene, camera)
    {        
        var origPosition = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
        var start = -viewCone/2;
        var end = viewCone/2;
        var distance = center.distanceTo(camera.position);
        var size = 2 * distance * Math.tan(0.5 * THREE.Math.degToRad(camera.fov));
        
        for(var i = 0; i < numViews; i++)
        {
            camera.position.set(origPosition.x, origPosition.y, origPosition.z);
            var radians = THREE.Math.degToRad(THREE.Math.lerp(start, end, i/(numViews - 1)));
            
            handleOffset(camera, radians, distance, size);
            
            renderer.render(scene, camera, smallRenderTargets[i], true);
            //Shouldn't need this
            planeMats[i].needsUpdate = true;
        }
        camera.position.set(origPosition.x, origPosition.y, origPosition.z);
    }
    
    //Move the camera 
    function handleOffset(camera, angle, distance, size)
    {   
        //angle needs to be in radians
        var offsetX = distance * Math.tan(angle); 
        
        //Get the right direction                
        var tempRight = new THREE.Vector3(camera.right.x * offsetX, camera.right.y * offsetX, camera.right.z * offsetX);
        
        camera.position.add(tempRight);
            
        camera.projectionMatrix.elements[8] = -2 * offsetX / (size * camera.aspect);
    }
    
    function doFinalRender()
    {
        renderer.render(bufferScene, bufferCam, bufferSceneRender, true);
        
        //Shouldn't need this either
        bufferMat.map = bufferSceneRender.texture;
        bufferMat.needsUpdate = true;
    };

    //Render loop, with options for 3D or 2D rendering
    HoloPlay.prototype.render = function (scene, camera, renderer){
        if(!initialized)
            return;
        
        if(scene === undefined)
            scene = _scene;
        if(camera === undefined)
            camera = _camera;
        if(renderer === undefined)
            renderer = _renderer;
        
        if(!threeD){
            if(camera.projectionMatrix.elements[8] != 0)
                camera.projectionMatrix.elements[8] = 0;
            renderer.render(scene, camera);
        } else{
            var worldRight = new THREE.Vector3(1,0,0);
            camera.right = worldRight.applyQuaternion(camera.quaternion);        
            
            camera.getWorldDirection(cameraForward);
            cameraForward.multiplyScalar(viewScale);
            
            center.addVectors(camera.position, cameraForward);

            captureViews(scene, camera);
            doFinalRender();

            renderer.render(finalRenderScene, finalRenderCamera);
        }
    };
    
    //*****EVENT LISTENERS*****//
    
    //Reset shader values on window resize to make it draw properly
    window.addEventListener('resize', function(){
        setShaderValues(jsonObj.DPI.value, jsonObj.pitch.value, jsonObj.slope.value, jsonObj.screenH.value, jsonObj.screenW.value, jsonObj.center.value);        
    });
    
    //Setting key listeners, Forward Slash for switching between 2D and 3D
    //Tilda to load a new file
    document.addEventListener('keydown', function(event){ 
            if(event.keyCode === 220){ 
                threeD = !threeD;
            } 
            else if(event.which == 192)
            {
                document.getElementById('file').click();
            } 
        }, false);
    
    
    //SHADER CODE
    var VertexShaderCode =         
            "varying vec2 vUv;"+"\n"+      
            "void main() {"+"\n"+        
            "vUv = uv;"+"\n"+
            "vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);"+"\n"+
            "gl_Position = projectionMatrix * modelViewPosition;"+"\n"+
            "}"
        ;
    var FragmentShaderCode = 
            "uniform float pitch;"+
            "uniform float tilt;"+
            "uniform float center;"+
            "uniform float numViews;"+
            "uniform float tilesX;"+
            "uniform float tilesY;"+
            "uniform float screenW;"+
            "uniform float screenH;"+
            "uniform float windowW;"+
            "uniform float windowH;"+
            "uniform float windowX;"+
            "uniform float windowY;"+

            "uniform sampler2D quiltTexture;"+
            "varying vec2 vUv;"+

            "vec4 texArr(vec3 uvz, vec2 ouv) {"+
            "float z = floor(uvz.z);"+
            "float x = mod(z, tilesX) / tilesX;"+
            "float y = floor(z / tilesX) / tilesY;"+
            "x += ouv.x / tilesX;"+
            "y += ouv.y / tilesY;"+
            "vec4 c = texture2D(quiltTexture, vec2(x, y));"+
            "return c;"+
            "}"+

            "void main()"+
            "{"+
            "vec4 rgb[3];"+
            "float subp = 1.0 / (screenW * 3.0);"+
            "float px = 1.0 / screenW;"+
            "float py = 1.0 / screenH;"+
            // "vec3 nuv = vec3(vUv.xy, 0);"+"\n"+
            "float invYPos = screenH - windowY - windowH;"+
            "vec3 nuv = vec3(vUv.xy, 0);"+
            "nuv.x *= windowW;"+
             "nuv.x += windowX;"+ //was commented out
            "nuv.x /= screenW;"+
            "nuv.y *= windowH;"+
             "nuv.y += invYPos;"+ //was commented out
            "nuv.y /= screenH;"+
            "float inAspect = float(screenH) / screenW;"+

            "for (int i = 0; i < 3; i++) {"+
            // "nuv.z = (nuv.x + float(i) * subp + vUv.y * tilt) * pitch - center;"+"\n"+
            "nuv.z = (nuv.x + float(i) * subp + nuv.y * tilt) * pitch - center;"+
            "nuv.z = mod(nuv.z, 1.0);"+
            "nuv.z *= numViews;"+
            // "nuv.xy = vUv.xy;"+
            "rgb[i] = texArr(nuv.xyz, vUv.xy);"+
            "}"+

//            "gl_FragColor = vec4(nuv.z / numViews, rgb[1].g, rgb[2].b, 1);"+
             "gl_FragColor = vec4(rgb[0].r, rgb[1].g, rgb[2].b, 1);"+"\n"+
            "}"
        ;

    //Call our initialization function once all our values are set
    init();
    
}