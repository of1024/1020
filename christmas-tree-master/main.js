let SCENE;
let CAMERA;
let RENDERER;
let CSSRENDERER;
let LOADING_MANAGER;
let IMAGE_LOADER;
let OBJ_LOADER;
let CONTROLS;
let MOUSE;
let RAYCASTER;

let TEXTURE;
let OBJECT;
let analyser;
let step = 0;
let renderer;
const uniforms = {
    time: { type: "f", value: 0.0 },
    step: { type: "f", value: 0.0 } };
const fftSize = 2048;
const _IS_ANIMATED = Symbol('is animated');
const _IS_VISIBLE = Symbol('is visible');

const rand = (max, min = 0) => min + Math.random() * (max - min);
const randInt = (max, min = 0) => Math.floor(min + Math.random() * (max - min));
const randChoise = arr => arr[randInt(arr.length)];
const polar = (ang, r = 1) => [r * cos(ang), r * sin(ang)];


main();


function main() {
    initAudio();
}


function init() {
    initScene();
    initCamera();
    initRenderer();
    initCSSRenderer();
    initLoaders();
    initControls();
    initRaycaster();
    initWorld();
    initTexture();

    loadTexture();
    loadModel();

    initEventListeners();
    initPopups();
    initPopups1();
    initSnowPoint();
    document.querySelector('.canvas-container').appendChild(RENDERER.domElement);
    document.querySelector('.canvas-container').appendChild(CSSRENDERER.domElement);
    animate();
}


function initAudio(){
    const file = "6005860EMK5112603.mp3"
const loader = new THREE.AudioLoader();
loader.load(file, function (buffer) {
    const listeners = new THREE.AudioListener();
    const audio = new THREE.Audio(listeners);
    audio.setBuffer(buffer);
    audio.play();
    analyser = new THREE.AudioAnalyser(audio, fftSize);
    init();
 });
}

function initSnowPoint(){
    const format = renderer.capabilities.isWebGL2 ?
    THREE.RedFormat :
    THREE.LuminanceFormat;
    uniforms.tAudioData = {
        value: new THREE.DataTexture(analyser.data, fftSize / 2, 1, format) };
    // addPlane(SCENE, uniforms, 3000);
    addSnow(SCENE, uniforms);
}
function initScene() {
    SCENE = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    initLights();
}


function initLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    SCENE.add(ambient);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left   = -50;
    directionalLight.shadow.camera.right  =  50;
    directionalLight.shadow.camera.top    =  50;
    directionalLight.shadow.camera.bottom = -50;

    SCENE.add(directionalLight);
}


function initCamera() {
    CAMERA = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    CAMERA.position.z = 100;
}


function initRenderer() {
    RENDERER = new THREE.WebGLRenderer({ alpha: true });
    RENDERER.setPixelRatio(window.devicePixelRatio);
    RENDERER.setSize(window.innerWidth, window.innerHeight);
    RENDERER.shadowMap.enabled = true;
    RENDERER.shadowMapSort = true;
}


function initCSSRenderer() {
    CSSRENDERER = new THREE.CSS3DRenderer();
    CSSRENDERER.setSize(window.innerWidth, window.innerHeight);
    CSSRENDERER.domElement.style.position = 'absolute';
    CSSRENDERER.domElement.style.top = 0;
}


function initLoaders() {
    LOADING_MANAGER = new THREE.LoadingManager();
    IMAGE_LOADER = new THREE.ImageLoader(LOADING_MANAGER);
    OBJ_LOADER = new THREE.OBJLoader(LOADING_MANAGER);
}


function initControls() {
    CONTROLS = new THREE.OrbitControls(CAMERA);
    CONTROLS.minPolarAngle = Math.PI * 1 / 4;
    CONTROLS.maxPolarAngle = Math.PI * 3 / 4;
    CONTROLS.minDistance = 10;
    CONTROLS.maxDistance = 150;
    CONTROLS.autoRotate = true;
    CONTROLS.autoRotateSpeed = -1.0;
    CONTROLS.update();

    MOUSE = new THREE.Vector2();
}


function initRaycaster() {
    RAYCASTER = new THREE.Raycaster();
}


function initTexture() {
    TEXTURE = new THREE.Texture();
}


function initWorld() {
    const sphere = new THREE.SphereGeometry(500, 64, 64);
    sphere.scale(-1, 1, 1);

    const texture = new THREE.Texture();

    const material = new THREE.MeshBasicMaterial({
        map: texture
    });

    IMAGE_LOADER.load('./world.jpg', (image) => {
        texture.image = image;
        texture.needsUpdate = true;
    });

    SCENE.add(new THREE.Mesh(sphere, material));
}


function loadTexture() {
    IMAGE_LOADER.load('./texture.jpg', (image) => {
        TEXTURE.image = image;
        TEXTURE.needsUpdate = true;
    });
}


function loadModel() {
    OBJ_LOADER.load('./model.obj', (object) => {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                switch (child.material.name) {
                    case 'Christmas_Tree':
                        child.material.map = TEXTURE;
                        break;
                    case 'red':
                        child[_IS_ANIMATED] = false;
                        child.material.color.setHSL(Math.random(), 1, 0.5);
                        break;
                    case 'pink':
                        child[_IS_ANIMATED] = false;
                        child.material.color.setHSL(Math.random(), 1, 0.5);
                        break;
                }
            }
        });

        object.scale.x = 0.3;
        object.scale.y = 0.3;
        object.scale.z = 0.3;
        object.rotation.x = -Math.PI / 2;
        object.position.y = -30;

        OBJECT = object;
        SCENE.add(OBJECT);
    });
}


function initEventListeners() {
    window.addEventListener('resize', onWindowResize,{ passive: false });
    window.addEventListener('mousemove', onMouseMove,{ passive: false });

    onWindowResize();
}


function onWindowResize() {
    CAMERA.aspect = window.innerWidth / window.innerHeight;
    CAMERA.updateProjectionMatrix();

    RENDERER.setSize(window.innerWidth, window.innerHeight);
    CSSRENDERER.setSize(window.innerWidth, window.innerHeight);
}


function onMouseMove(event) {
    MOUSE.x = (event.clientX / window.innerWidth) * 2 - 1;
    MOUSE.y = -(event.clientY / window.innerHeight) * 2 + 1;
}


function initPopups() {
    const popupSource = document.querySelector('.popup-3d');

    popupSource[_IS_VISIBLE] = true;

    const popup = new THREE.CSS3DObject(popupSource);

    popup.position.x = 0;
    popup.position.y = -10;
    popup.position.z = 30;
    popup.scale.x = 0.05;
    popup.scale.y = 0.05;
    popup.scale.z = 0.05;

    SCENE.add(popup);
}

function initPopups1() {
    const popupSource = document.querySelector('.popup-top');

    popupSource[_IS_VISIBLE] = true;

    const popup = new THREE.CSS3DObject(popupSource);

    popup.position.x = 0;
    popup.position.y = 35;
    popup.position.z = 0;
    popup.scale.x = 0.05;
    popup.scale.y = 0.05;
    popup.scale.z = 0.05;

    SCENE.add(popup);
}

function animate(time) {
    analyser.getFrequencyData();
    step = (step + 1) % 1000;
      uniforms.time.value = time;
      uniforms.step.value = step;
    requestAnimationFrame(animate);
    CONTROLS.update();
    render();
}


function render() {
    CAMERA.lookAt(SCENE.position);

    RAYCASTER.setFromCamera(MOUSE, CAMERA);
    paintHoveredBalls();
    updatePopups();

    RENDERER.render(SCENE, CAMERA);
    CSSRENDERER.render(SCENE, CAMERA);
}


function paintHoveredBalls() {
    if (OBJECT) {
        const intersects = RAYCASTER.intersectObjects(OBJECT.children);

        for (let i = 0; i < intersects.length; i++) {
            switch (intersects[i].object.material.name) {
                case 'red':
                    if (!intersects[i].object[_IS_ANIMATED]) {
                        anime({
                            targets: intersects[i].object.material.color,
                            r: 0,
                            g: 0,
                            b: 0,
                            easing: 'easeInOutQuad'
                        });
                        intersects[i].object[_IS_ANIMATED] = true;
                    }
                    break;
                case 'pink':
                    if (!intersects[i].object[_IS_ANIMATED]) {
                        anime({
                            targets: intersects[i].object.material.color,
                            r: 1,
                            g: 1,
                            b: 1,
                            easing: 'easeInOutQuad'
                        });
                        intersects[i].object[_IS_ANIMATED] = true;
                    }
                    break;
            }
        }
    }
}


function updatePopups() {
    const popupSource = document.querySelector('.popup-3d');
    const angle = CONTROLS.getAzimuthalAngle();

    if (Math.abs(angle) > .9 && popupSource[_IS_VISIBLE]) {
        anime({
            targets: popupSource,
            opacity: 0,
            easing: 'easeInOutQuad'
        });
        popupSource[_IS_VISIBLE] = false;
    } else if (Math.abs(angle) < .9 && !popupSource[_IS_VISIBLE]) {
        anime({
            targets: popupSource,
            opacity: 1,
            easing: 'easeInOutQuad'
        });
        popupSource[_IS_VISIBLE] = true;
    }
}

function addSnow(scene, uniforms) {
    const vertexShader = `
    attribute float size;
    attribute float phase;
    attribute float phaseSecondary;
    varying vec3 vColor;
    varying float opacity;
    uniform float time;
    uniform float step;
    float norm(float value, float min, float max ){
     return (value - min) / (max - min);
    }
    float lerp(float norm, float min, float max){
     return (max - min) * norm + min;
    }
    float map(float value, float sourceMin, float sourceMax, float destMin, float destMax){
     return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
    }
    void main() {
     float t = time* 0.0006;
     vColor = color;
     vec3 p = position;
     p.y = map(mod(phase+step, 1000.0), 0.0, 1000.0, 25.0, -8.0);
     p.x += sin(t+phase);
     p.z += sin(t+phaseSecondary);
     opacity = map(p.z, -200.0, 12.0, 0.0, 1.0);
     vec4 mvPosition = modelViewMatrix * vec4( p, 1.0 );
     gl_PointSize = size * ( 180.0 / -mvPosition.z );
     gl_Position = projectionMatrix * mvPosition;
    }
    `;

    const fragmentShader = `
    uniform sampler2D pointTexture;
    varying vec3 vColor;
    varying float opacity;
    void main() {
     gl_FragColor = vec4( vColor, opacity );
     gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
    }
    `;
    function createSnowSet(sprite) {
     const totalPoints = 300;
     const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
       ...uniforms,
       pointTexture: {
        value: new THREE.TextureLoader().load(sprite) } },


        vertexShader,
        fragmentShader,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true,
        vertexColors: true });


     const geometry = new THREE.BufferGeometry();
     const positions = [];
     const colors = [];
     const sizes = [];
     const phases = [];
     const phaseSecondaries = [];

     const color = new THREE.Color();

     for (let i = 0; i < totalPoints; i++) {
      const [x, y, z] = [rand(25, -25), 0, rand(15, -150)];
      positions.push(x);
      positions.push(y);
      positions.push(z);

      color.set(randChoise(["#f1d4d4", "#f1f6f9", "#eeeeee", "#f1f1e8"]));

      colors.push(color.r, color.g, color.b);
      phases.push(rand(1000));
      phaseSecondaries.push(rand(1000));
      sizes.push(rand(4, 2));
     }

     geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3));

     geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
     geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
     geometry.setAttribute("phase", new THREE.Float32BufferAttribute(phases, 1));
     geometry.setAttribute(
      "phaseSecondary",
      new THREE.Float32BufferAttribute(phaseSecondaries, 1));


     const mesh = new THREE.Points(geometry, shaderMaterial);

     scene.add(mesh);
    }
    const sprites = [
    "https://assets.codepen.io/3685267/snowflake1.png",
    "https://assets.codepen.io/3685267/snowflake2.png",
    "https://assets.codepen.io/3685267/snowflake3.png",
    "https://assets.codepen.io/3685267/snowflake4.png",
    "https://assets.codepen.io/3685267/snowflake5.png"];

    sprites.forEach(sprite => {
     createSnowSet(sprite);
    });
   }
