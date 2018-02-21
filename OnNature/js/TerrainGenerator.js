var grassMat;
var grassVidTex;
var grassGifTextures = [];

var generateTerrain = function(object, scene){
    let loader = new THREE.JSONLoader();
    
    let grassVideo = document.getElementById('grassVideo');
    videoArray.push(grassVideo);
    
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg1.jpg", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg2.jpg", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg3.png", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg4.jpg", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg5.jpg", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg6.png", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg7.png", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    grassGifTextures.push(textureLoader.load("images/Grass/grassImg8.png", THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter));
    
    for(let i = 0; i < grassGifTextures.length; i++){
        grassGifTextures[i].repeat.set( 1, 1 );
    }
    
    grassVidTex = new THREE.VideoTexture(grassVideo, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
    grassVidTex.repeat.set( 1, 1 );
    
    loader.load('models/Circle.json', 
        function(geometry){
        
            for(let i = 0; i < geometry.vertices.length; i++){
                geometry.vertices[i].x *= 15;
                geometry.vertices[i].z *= 15;
                geometry.vertices[i].y = globalNoise.noise(geometry.vertices[i].x, geometry.vertices[i].z);
            }
            
            geometry.verticesNeedUpdate = true;
            geometry.normalsNeedUpdate = true;
            geometry.elementsNeedUpdate = true;
            geometry.groupsNeedUpdate = true;
            geometry.lineDistancesNeedUpdate = true;
            geometry.colorsNeedUpdate = true;
            geometry.uvsNeedUpdate = true;
            geometry.computeBoundingBox ();
            geometry.computeBoundingSphere ();
        
            grassMat = new THREE.MeshBasicMaterial({map: grassVidTex, side: THREE.BackSide});
        
            grassMat.needsUpdate = true;
            object = new THREE.Mesh( geometry, grassMat );
        
        
            scene.add(object);
        });    
    
}