
    var modelViewer = document.querySelector('#model');

    var savedTarget = modelViewer.getCameraTarget();
    var savedOrbit = modelViewer.getCameraOrbit();

    function activateWalkMode() {
        modelViewer = document.querySelector('#model');
        console.log("walk")
        const orbit = modelViewer.getCameraOrbit();
        orbit.radius = "0";
        modelViewer.cameraOrbit = orbit.toString();
        const target = modelViewer.getCameraTarget();
        target.y = 100;
        modelViewer.cameraTarget = target.x + "m " + target.y + "m " + target.z + "m";

        modelViewer.disableZoom = true;
        // This pauses turntable rotation
        modelViewer.dispatchEvent(new CustomEvent(
        'camera-change', {detail: {source: 'user-interaction'}}));
    }

    function activateSurroundMode() {
        modelViewer = document.querySelector('#model');
        console.log("surround")
        modelViewer.disableZoom = false;
        modelViewer.cameraOrbit = savedOrbit;
        modelViewer.cameraTarget = savedTarget
    }

    function moveForward() {
      modelViewer = document.querySelector('#model');
      const target = modelViewer.getCameraTarget();
      const orbit = modelViewer.getCameraOrbit();
      console.log(target)
      console.log(orbit)
      target.x -= 45*Math.sin(orbit.phi)*Math.sin(orbit.theta);
      target.z -= 45*Math.cos(orbit.theta)*Math.sin(orbit.phi);
      modelViewer.cameraTarget = target.x + "m " + target.y + "m " + target.z + "m";

      // This pauses turntable rotation
      modelViewer.dispatchEvent(new CustomEvent(
            'camera-change', {detail: {source: 'user-interaction'}}));
    }

    function moveBackword() {
      modelViewer = document.querySelector('#model');
      const target = modelViewer.getCameraTarget();
      const orbit = modelViewer.getCameraOrbit();
      console.log(target)
      console.log(orbit)
      target.x += 45*Math.sin(orbit.phi)*Math.sin(orbit.theta);
      target.z += 45*Math.cos(orbit.theta)*Math.sin(orbit.phi);
      modelViewer.cameraTarget = target.x + "m " + target.y + "m " + target.z + "m";
  
      // This pauses turntable rotation
      modelViewer.dispatchEvent(new CustomEvent(
            'camera-change', {detail: {source: 'user-interaction'}}));
    }

    modelViewer.addEventListener('keydown', function(e){
      if(e.key === 'w')
      moveForward();
    })

    modelViewer.addEventListener('keydown', function(e){
      if(e.key === 's')
      moveBackword();
    })

  