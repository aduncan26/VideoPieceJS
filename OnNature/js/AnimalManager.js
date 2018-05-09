var deltaTime;
var flock;

var sepSine = 0;
var sepHolder = 0;
var sepSineInc = 0.3;

var flockTime = 1;
var numBoids = 70;

var mouse;

var holes = [];
var maxSize = 2500;

var mice = [];

var sceneFox;

var maxCrowAudio = 1;

var miceMat;
var foxMat;
var crowMat;

var miceVidTex;
var miceGifTextures = [];
var foxVidTex;
var foxGifTextures = [];
var crowVidTex;
var crowGifTextures = [];

function initMiceAndHoles (){
    let vid = document.getElementById("mouseVideo");
    videoArray.push(vid);
    
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg1.gif"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg2.png"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg3.png"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg4.gif"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg5.jpg"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg6.jpg"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg7.jpg"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg8.png"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg9.png"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg10.jpg"));
    miceGifTextures.push(textureLoader.load("images/Mouse/mouseImg11.png"));
    
    for(let i = 0; i < miceGifTextures.length; i++){
        miceGifTextures[i].minFilter = THREE.NearestFilter;
    }
    
    miceVidTex = new THREE.VideoTexture(vid);
    miceVidTex.minFilter = THREE.NearestFilter;
    let _geo = new THREE.PlaneGeometry(10, 10);//new THREE.SphereGeometry(5, 8, 8);
    miceMat = new THREE.MeshBasicMaterial({map: miceVidTex, side: THREE.DoubleSide});
    
    for(var i = 0; i < 30; i++){
        let x = (Math.random() - 0.5) * maxSize;
        let z = (Math.random() - 0.5) * maxSize;
        let y = globalNoise.noise(x, z);
        
//        let tempGeo = new THREE.SphereGeometry(10);
//        let tempMat = new THREE.MeshBasicMaterial();
//        
//        let sp = new THREE.Mesh(tempGeo, tempMat);
//        sp.position.set(x,y,z);
//        scene.add(sp);
        
        holes.push(new THREE.Vector3(x, y, z));
    }
    
    for(var i = 0; i < 12; i++){
        let x = (Math.random() - 0.5) * maxSize;
        let z = (Math.random() - 0.5) * maxSize;
        let y = globalNoise.noise(x, z);
        let mouseSize = (8 + (Math.random() * 4))/10;
        mice.push(new Mouse(scene, x, y, z, _geo, miceMat, mouseSize));
    }
}

function makeFox(){
    let vid = document.getElementById("foxVideo");
    videoArray.push(vid);
    
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg1.jpg"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg2.jpg"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg3.png"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg4.jpg"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg5.jpg"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg6.png"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg7.jpg"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg8.png"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg9.jpg"));
    foxGifTextures.push(textureLoader.load("images/Fox/foxImg10.png"));
    
    for(let i = 0; i < foxGifTextures.length; i++){
        foxGifTextures[i].minFilter = THREE.NearestFilter;
    }
    
    foxVidTex = new THREE.VideoTexture(vid);
    foxVidTex.minFilter = THREE.NearestFilter;
    
    let _geo = new THREE.PlaneGeometry(25, 25);
    foxMat = new THREE.MeshBasicMaterial({map: foxVidTex, side: THREE.DoubleSide});
    
    let x = (Math.random() - 0.5) * maxSize;
    let z = (Math.random() - 0.5) * maxSize;
    let y = globalNoise.noise(x, z);
    
    sceneFox = new Fox(scene, x, y, z, _geo, foxMat);
//    sceneFox = new Fox(scene, 0, 0, 0, _geo, _mat);

}

function makeFlock() {  
    let vid = document.getElementById("ravenVideo");
    videoArray.push(vid);
    
    crowGifTextures.push(textureLoader.load("images/Crow/crowImg1.jpg"));
    crowGifTextures.push(textureLoader.load("images/Crow/crowImg2.jpg"));
    crowGifTextures.push(textureLoader.load("images/Crow/crowImg3.jpg"));
    crowGifTextures.push(textureLoader.load("images/Crow/crowImg4.jpg"));
    crowGifTextures.push(textureLoader.load("images/Crow/crowImg5.jpg"));
    
    for(let i = 0; i < crowGifTextures.length; i++){
        crowGifTextures[i].minFilter = THREE.NearestFilter;
    }
    
    crowVidTex = new THREE.VideoTexture(vid);
    crowVidTex.minFilter = THREE.NearestFilter;
    let _geo = new THREE.PlaneGeometry(10, 10);//new THREE.SphereGeometry(5, 8, 8);
    crowMat = new THREE.MeshBasicMaterial({map: crowVidTex, side: THREE.DoubleSide});

    flock = new Flock();
    // Add an initial set of boids into the system
    for (var i = 0; i < numBoids; i++) {
        var b = new Boid(scene, 2500, 250, (Math.random() - 0.5) * 100, _geo, crowMat);
        flock.addBoid(b);
        allClickableObjects.push(b.getChildObj());
    }
    crowAudio.play();
}

function createLandCreatures(){
    initMiceAndHoles();
    makeFox();
}

function runMouse(){
    for(let i = 0; i < mice.length; i++){
        if(mice[i] === undefined){
            return;
        }    
        mice[i].run();
    }
}

function runFox(){
    sceneFox.run();
}

function runAnimalAudio(glitching){
    let minDist = 100000;
    let noSoundDist = 1200;
    let average = new THREE.Vector3();
    
    if(!flock){
        return;
    }
    for(let i = 0; i < numBoids; i++){
        average.add(flock.getBoid(i));
        let d = playerObj.getWorldPosition().distanceTo(flock.getBoid(i));
        if(d < minDist){
            minDist = d;
        }
    }

    average.divideScalar(numBoids);

    let overall = average.distanceTo(playerObj.getWorldPosition()) + minDist;
    overall /= 2;
    
    if(!glitching){
        crowAudio.volume = maxCrowAudio - maxCrowAudio * Math.min(overall/noSoundDist, 1);
    } else{
        dCrowAudio.volume = maxCrowAudio - maxCrowAudio * Math.min(overall/noSoundDist, 1);
    }
}