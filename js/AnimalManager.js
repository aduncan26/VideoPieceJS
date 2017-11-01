var deltaTime;
var flock;

var sepSine = 0;
var sepHolder = 0;
var sepSineInc = 0.3;

var flockTime = 1;

function makeFlock() {  
    let vid = document.getElementById("ravenVideo");
    videoArray.push(vid);
    let vidTex = new THREE.VideoTexture(vid);
    vidTex.minFilter = THREE.NearestFilter;
    let _geo = new THREE.PlaneGeometry(10, 10);//new THREE.SphereGeometry(5, 8, 8);
    let _mat = new THREE.MeshBasicMaterial({map: vidTex, side: THREE.DoubleSide});

    flock = new Flock();
    // Add an initial set of boids into the system
    for (var i = 0; i < 70; i++) {
        var b = new Boid(scene, 2500, 250, (Math.random() - 0.5) * 100, _geo, _mat);
        flock.addBoid(b);
        allClickableObjects.push(b.getObj());
        scene.add(b.getObj());
    }
}