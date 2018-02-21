var scope = this;

var trees = [];

var maxTreeAudio = 0.6;
var minTreeAudio = 0.2;

var treeMat;
var skyMat;

var treeVidTex;
var treeGifTextures = [];

var skyVidTex;
var skyGifTextures = [];

var textureLoader = new THREE.TextureLoader();
                    
function createVideoObject(xPos, zPos, yRot, width, height, material){
    let vidGeo = new THREE.PlaneGeometry(width, height);
    let vidPlane = new THREE.Mesh(vidGeo, material);

    let yPos = globalNoise.noise(xPos, zPos) + height/2;

    vidPlane.position.set(xPos, yPos, zPos);
    vidPlane.rotation.y = yRot;

    scene.add(vidPlane);
    allClickableObjects.push(vidPlane);
    trees.push(vidPlane);
}

function changeVideoSpeed(speed){
    
    for(let i = 0; i < videoArray.length; i++){
        videoArray[i].playbackRate = speed;
    }
}

function createTrees(){
    let video = document.getElementById( 'treeVideo' );
    videoArray.push(video);
    
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg1.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg2.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg3.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg4.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg5.png"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg6.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg7.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg8.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg9.png"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg10.gif"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg11.png"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg12.jpg"));
    treeGifTextures.push(textureLoader.load( "images/Tree/treeImg13.jpg"));
    
    for(let i = 0; i < treeGifTextures.length; i++){
        treeGifTextures[i].minFilter = THREE.LinearFilter;
        treeGifTextures[i].magFilter = THREE.LinearFilter;
        treeGifTextures[i].format = THREE.RGBFormat;
    }

    treeVidTex = new THREE.VideoTexture(video);
    treeVidTex.minFilter = THREE.LinearFilter;
    treeVidTex.magFilter = THREE.LinearFilter;
    treeVidTex.format = THREE.RGBFormat;
    treeMat = new THREE.MeshBasicMaterial({map: treeVidTex, side: THREE.DoubleSide});
    
    var camFacing = new THREE.Vector3();
    camFacing.addVectors(camera.position, camera.getWorldDirection());
    camFacing.multiplyScalar(12);
    createVideoObject(camFacing.x, camFacing.z, 0, 80, 80, treeMat);
    
    let tempVec2 = new THREE.Vector2(0,0);
    
    for(var i = 0; i < 100; i++){
        
        do{
            tempVec2.x = (Math.random() - 0.5) * 2800;
            tempVec2.y = (Math.random() - 0.5) * 2800;       
        } while(tempVec2.lengthSq() > (worldEdge * worldEdge));
                
        while(Math.abs(tempVec2.x) < 50 && Math.abs(tempVec2.y) < 15){
//        while(Math.abs(tempVec2.x) < 500 && Math.abs(tempVec2.y) < 150){
            tempVec2.multiplyScalar(1.1);
        }
        
        let w = 80 + (Math.random()) * 20;
        
        console.log(tempVec2.x + " " + tempVec2.y + " " + i);
        var rotY = 0;
        createVideoObject(tempVec2.x, tempVec2.y, rotY, w, w, treeMat);
    }
}

function createSky(){
    let skyVideo = document.getElementById('skyVideo');
    videoArray.push(skyVideo);
    
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg1.jpg"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg2.jpg"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg3.jpg"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg4.jpg"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg5.png"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg6.png"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg7.jpg"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg8.jpg"));
    skyGifTextures.push(textureLoader.load("images/Sky/skyImg9.png"));
        
    for(let i = 0; i < skyGifTextures.length; i++){
        skyGifTextures[i].repeat.set(2, 2);
        skyGifTextures[i].wrapS = skyGifTextures[i].wrapT = THREE.RepeatWrapping;
    }
    
    skyVidTex = new THREE.VideoTexture(skyVideo, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
    skyVidTex.repeat.set(2, 2);
    let skyGeo = new THREE.SphereGeometry(2000, 64, 64);
    skyMat = new THREE.MeshBasicMaterial({map: skyVidTex, side: THREE.BackSide})
    let sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

function createSceneObjects(){
    createSky();
    
    var terrain;
    generateTerrain(terrain, scene);

    createTrees();
    
}

function runEnvironmentAudio(glitching){
    let minDist = 100000;
    let noSoundDist = 100;
    
    for(let i = 0; i < trees.length; i++){
        let d = playerObj.getWorldPosition().distanceTo(trees[i].position);
        if(d < minDist){
            minDist = d;
        }
    }

    let adjust = maxTreeAudio - minTreeAudio;
    
    if(!glitching){
        treeAudio.volume = adjust - adjust * Math.min(minDist/noSoundDist, 1) + minTreeAudio;
                
    } else{
        dTreeAudio.volume = adjust - adjust * Math.min(minDist/noSoundDist, 1) + minTreeAudio;
    }
}


