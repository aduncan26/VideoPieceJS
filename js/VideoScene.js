var scope = this;
                    
var vidCamera, vidScene, vidRenderer;
var vidControls;

var video = document.getElementById( 'treeVideo' );

var vidTex1 = new THREE.VideoTexture(video);
vidTex1.minFilter = THREE.LinearFilter;
vidTex1.magFilter = THREE.LinearFilter;
vidTex1.format = THREE.RGBFormat;
var vidMat1 = new THREE.MeshBasicMaterial({map: vidTex1, side: THREE.DoubleSide});

var grassVideo = document.getElementById('grassVideo');
var grassTex = new THREE.VideoTexture(grassVideo, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
grassTex.repeat.set( 1, 1 );


var skyVideo = document.getElementById('skyVideo');

var skyTex = new THREE.VideoTexture(skyVideo, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
skyTex.repeat.set(2, 2);
var skyGeo = new THREE.SphereGeometry(2000, 64, 64);
var skyMat = new THREE.MeshBasicMaterial({map: skyTex, side: THREE.BackSide})
var sky = new THREE.Mesh(skyGeo, skyMat);

function createVideoObject(xPos, zPos, yRot, width, height, material){
    var vidGeo = new THREE.PlaneGeometry(width, height);
    var vidPlane = new THREE.Mesh(vidGeo, material);

    var yPos = globalNoise.noise(xPos, zPos) + height/2;

    vidPlane.position.set(xPos, yPos, zPos);
    vidPlane.rotation.y = yRot;

    vidScene.add(vidPlane);
}

var openWindows = [];

var queryTerm = 'nature';

var urls = [
    'https://www.google.com/search?tbm=isch&q=' + queryTerm,
    'http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=' + queryTerm,
    'https://www.flickr.com/search/?ytcheck=1&new_session=1&text=' + queryTerm,
    'https://imgur.com/search?q=' + queryTerm,
    'https://www.bing.com/images/search?q=' + queryTerm + '&FORM=BILH1',
    'https://duckduckgo.com/?q=' + queryTerm + '&t=h_&iax=1&ia=images', 'https://images.search.yahoo.com/search/images;_ylt=A0LEVxfPPNxZMkAALyZXNyoA;_ylu=X3oDMTE0NzBpZW00BGNvbG8DYmYxBHBvcwMxBHZ0aWQDVUkyQzNfMQRzZWMDcGl2cw--?p=' + queryTerm + '&fr2=piv-web&fr=yfp-t',
    'https://www.tumblr.com/search/' + queryTerm,
    'https://search.naver.com/search.naver?where=image&sm=tab_jum&query=' + queryTerm,
    'https://yandex.com/images/search?text=' + queryTerm,
    'http://image.so.com/i?q=' + queryTerm + '&src=tab_image',
    'https://search.daum.net/search?w=img&nil_search=btn&DA=NTB&enc=utf8&q=' + queryTerm
]

function launchImageWindow(imageURL){
    var width = 300 + Math.floor(Math.random() * 600);
    var height = 300 + Math.floor(Math.random() * 600);

    var posX = Math.random() * (window.innerWidth - width/2);
    var posY = Math.random() * (window.innerHeight - height/2);

    var newWin = window.open(imageURL,'windowName' + openWindows.length,'resizable=1,scrollbars=1,fullscreen=100,height=' + height.toString() + ',width=' + width.toString() + ',left=' + posX.toString() + ',top=' + posY.toString(), 'toolbar=0, menubar=0,status=1');

    openWindows.push(newWin);

    console.log(newWin);
}

function closeAllWindows(){
    for(var i = openWindows.length - 1; i >= 0; i--){
        var oldWindow = openWindows.pop();
        oldWindow.close();
    }

    console.log(openWindows.length);
}

function vidInit() {

    var container = document.getElementById( 'container' );


    vidCamera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );

    vidScene = new THREE.Scene();

    vidScene.add(vidCamera);
    vidScene.add(sky);
    var terrain;
    
//    vidScene.add(googleGlobe);

    generateTerrain(terrain, vidScene);

    vidRenderer = new THREE.WebGLRenderer();
    vidRenderer.setSize(window.innerWidth, window.innerHeight);

    for(var i = 0; i < 150; i++){
        var x = (Math.random() - 0.5) * 2000;
        var z = (Math.random() - 0.5) * 2000;
        var rotY = 0;//Math.random() * Math.PI;
        createVideoObject(x, z, rotY, 100, 100, vidMat1);
    }

//                for(var i = 0; i < urls.length; i++){
//                    launchImageWindow(urls[i]);
//                }

    document.body.appendChild(vidRenderer.domElement);

    vidControls = new THREE.PointerLockControls( vidCamera, vidScene );
}

window.addEventListener('keydown', function(event){if(event.keycode===81) closeAllWindows();});
