export function disposeThree(renderer, scene, debug) {
  if (debug) {
    console.log("Disposing three.js");
  }

  renderer.dispose();

  scene.traverse((object3d) => {
    if (!object3d.isMesh) {
      return;
    }

    if (debug) {
      console.log("Disposing geometry");
    }

    object3d.geometry.dispose();

    if (object3d.material.isMaterial) {
      disposeMaterial(object3d.material);
    } else {
      for (const material of object3d.material) {
        disposeMaterial(material);
      }
    }
  });
}

function disposeMaterial(material) {
  material.dispose();

  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value === "object" && "minFilter" in value) {
      value.dispose();
    }
  }
}
