if (navigator.xr) {
    navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['hand-tracking']
    }).then(onSessionStarted);
}

function onSessionStarted(session) {
    session.addEventListener('end', onSessionEnded);

    let xrReferenceSpace;
    let renderer = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild(renderer.domElement);

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);
    let light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    // Add a cube to the scene
    let geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.set(0, 1.5, -1);
    scene.add(cube);

    session.requestReferenceSpace('local').then((referenceSpace) => {
        xrReferenceSpace = referenceSpace;

        renderer.setAnimationLoop((time, frame) => {
            let session = frame.session;
            let pose = frame.getViewerPose(xrReferenceSpace);

            if (pose) {
                let inputSources = session.inputSources;

                for (let inputSource of inputSources) {
                    if (inputSource.hand) {
                        let hand = inputSource.hand;
                        // Process hand tracking data
                        for (let i = 0; i < hand.joints.length; i++) {
                            let joint = hand.joints[i];
                            if (joint) {
                                let jointPose = frame.getJointPose(joint, xrReferenceSpace);
                                if (jointPose) {
                                    // Handle the joint's pose
                                    console.log(jointPose.transform.position);
                                }
                            }
                        }
                    }
                }

                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.render(scene, camera);
            }
        });
    });
}

function onSessionEnded(event) {
    console.log("Session ended");
}
