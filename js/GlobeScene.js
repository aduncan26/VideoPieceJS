var globeCamera, globeScene, globeRenderer, globeControls;



function globeInit(){
    
//    var holder
    
    globeRenderer = new THREE.WebGLRenderer();
    globeRenderer.setSize(window.innerWidth, window.innerHeight);
    
    globeCamera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 5000 );

//    globeCamera.position.y = -490;
    
    globeScene = new THREE.Scene();
    globeScene.add(globeCamera);
    document.body.appendChild(globeRenderer.domElement);
    
    createGlobes()
}

function createGlobes(){
    var googleGlobeTex = new THREE.TextureLoader().load( "../images/googleMaps.png" );
    var googleGlobeMat = new THREE.MeshBasicMaterial({map:googleGlobeTex, side: THREE.BackSide});
    var googleGlobeGeo = new THREE.SphereGeometry(100, 100, 256);
    var googleGlobe = new THREE.Mesh(googleGlobeGeo, googleGlobeMat);
    
    var mercatorTex = new THREE.TextureLoader().load( "../images/mercatorMap.jpg" );
    var mercatorMat = new THREE.MeshBasicMaterial ({map:mercatorTex, side: THREE.FrontSide});
    var mercatorGeo = new THREE.SphereGeometry(50, 50, 128);
    var mercatorGlobe = new THREE.Mesh(mercatorGeo, mercatorMat);
    
    globeScene.add(googleGlobe);
    globeScene.add(mercatorGlobe);
}

function globeDestroy(){
    document.body.removeChild(globeRenderer.domElement);
}

