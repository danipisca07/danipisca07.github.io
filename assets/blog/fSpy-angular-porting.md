# Engineering Case Study: Porting fSpy to the Web

When building web applications that mix 3D models with real-world photographs, calculating the exact camera parameters (position, rotation, field of view) is a notoriously difficult problem. The open-source desktop app fSpy solves this using vanishing point geometry, but its architecture—locked inside Electron and Redux—makes it unusable for modern web pipelines.

This case study breaks down the architectural challenges of dismantling a legacy desktop tool and rebuilding it as a reactive, web-native Angular component with direct Three.js integration.

> If you want to know more about why I needed to do this: [Medium post](https://medium.com/@danielepiscaglia/porting-fspy-to-angular-bringing-3d-camera-matching-calibration-to-the-web-05b773b62adc)

## Prerequisites checklist

To fully grasp the architectural decisions discussed in this case study, the following context is helpful:

- Understanding of 3D coordinate systems (left-handed vs. right-handed, Y-up)
- Familiarity with modern Angular (version 17+, specifically Signals)
- Basic knowledge of state management paradigms (Redux vs. Reactive)


## Project structure

The workspace is designed as a standard Angular monorepo to separate the complex solver logic from the testing environment:

```text
fSpy/
└── projects/
    ├── fspy-calibrator/     # The library containing the core engine
    └── demo/                # The live testing environment
```


## The Verbatim Port: Risk Mitigation in Reverse Engineering

The core value of fSpy is its mathematical solver, which computes a 4x4 transformation matrix from 2D canvas coordinates.

**The Problem:** Rewriting complex linear algebra and vanishing point math from scratch is a massive liability. Even a minor typo in a matrix transformation could result in microscopic floating-point deviations that destroy calibration accuracy.
**The Solution:** I opted for a strict "Verbatim Port" of the core engine. The original TypeScript solver files (`solver/`, `types/`, `defaults/`) were copied line-by-line into the Angular library without a single refactor. By treating the math engine as a black box and completely decoupling it from the UI layer, I guaranteed zero risk of introducing mathematical regressions while safely discarding the Electron shell.

## State Management: From Redux to Angular Signals

The original fSpy desktop app relied on Redux. Every mouse drag on the calibration canvas dispatched an action, updated a reducer, and triggered a re-render.

**The Problem:** Shipping a Redux store inside a reusable Angular UI component is heavy, opinionated, and forces unnecessary dependencies on the consumer.
**The Solution:** I replaced the entire Redux architecture with Angular Signals. Every original Redux slice (`globalSettings`, `imageState`, `calibrationSettingsBase`, `calibrationSettings2VP`, `controlPointsStateBase`, `controlPointsState2VP`) was mapped exactly to a `WritableSignal` inside a scoped `CalibrationStateService`.
This allowed me to build mutator methods that mimicked Redux action creators, but powered by Angular's native reactivity. An `effect()` watches these Signals and automatically defers the solver execution to the next tick (`setTimeout(..., 0)`), perfectly replicating the original middleware behavior without the boilerplate.

## 3D Math and the Coordinate System Hell

fSpy outputs raw geometric data, but web developers almost exclusively use Three.js for 3D rendering.

**The Problem:** fSpy and Three.js speak different mathematical languages. fSpy outputs matrices with its own coordinate conventions and uses radians for the field of view (FOV). Three.js expects a right-handed, Y-up coordinate system, column-major matrices, and FOV in degrees. Giving a web developer raw fSpy data leaves them with a frustrating math puzzle.
**The Solution:** I implemented an adapter layer that intercepts the `CameraParameters` from the solver and transforms them in real-time. The library exposes a derived `ThreeCameraConfig` object and a helper function (`applyThreeCameraConfig`) that instantly translates the math into a `THREE.PerspectiveCamera`, completely abstracting the coordinate system mismatch away from the developer.

## Quality Assurance: Binary Parsers and Parity Tests

Because the engine was ported into a completely different framework, I needed absolute certainty that it still produced the exact same numbers as the desktop app.

**The Problem:** You cannot test camera calibration by "eyeballing" it. I needed to feed the Angular component the exact same inputs as the desktop app and verify the outputs.
**The Solution:** I wrote a custom binary parser capable of reading original `.fspy` project files. The binary format opens with a 16-byte header: 4 bytes for the `"fspy"` magic string, followed by three `uint32` fields encoding the version, the JSON state payload size, and the raw image data size respectively. The parser then extracts the `SavedState` JSON from real fSpy desktop saves, feeds the control points into the Angular Signal state, and asserts that the resulting matrix matches the original with a maximum error tolerance of `1e-4`. This guarantees 100% scientific reliability.

## Running everything together

To see the architectural decisions in action, the library can be dropped into an Angular template. The complex state management and math translations are entirely hidden behind a clean API.

```typescript
import { Component } from '@angular/core';
import * as THREE from 'three';
import { CalibratorComponent, applyThreeCameraConfig, ThreeCameraConfig } from 'fspy-calibrator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CalibratorComponent],
  template: `
    <fspy-calibrator
      [imageUrl]="sourceImage"
      [cameraDistanceScale]="sceneScale"
      (threeCameraChange)="syncWithThreeJs($event)">
    </fspy-calibrator>
  `
})
export class AppComponent {
  sourceImage = 'assets/photo.jpg'; // ── CUSTOMIZE ── Path to the image being calibrated
  sceneScale = 10; // ── CUSTOMIZE ── Adjust this multiplier to match your 3D world scale

  private camera = new THREE.PerspectiveCamera();

  syncWithThreeJs(config: ThreeCameraConfig | null) {
    if (config) {
      applyThreeCameraConfig(this.camera, config);
      // The camera is now perfectly aligned with the photograph's perspective
    }
  }
}
```


## Troubleshooting table

| Issue | Cause | Solution |
| :-- | :-- | :-- |
| Signals not triggering solver | Mutating object references directly | Ensure mutators create new object references (`{ ...state }`) before updating the `WritableSignal`, as Angular relies on reference equality. |
| Three.js objects appear inverted | Matrix column-major mismatch | Ensure you are using the `ThreeCameraConfig` output, not the raw `CameraParameters`, as the raw matrix is row-major. |
| Test suite fails on `.fspy` files | Binary format header mismatch | The parser expects a 16-byte header: `[4 bytes "fspy"] [uint32 version] [uint32 stateSize] [uint32 imageSize]`. Ensure files are saved from the latest fSpy desktop version. |

## Quick reference command block

To explore the code, see how the Redux-to-Signals transition was handled, or check out the binary parser implementation, you can view the full source code in the repository.

```bash
# Clone the repository
git clone https://github.com/danipisca07/aSpy

# Install dependencies and run the demo
npm install
ng serve demo

```

*For a deep dive into the code and the exact implementation of the solutions discussed above, [check out the repository on GitHub](https://github.com/danipisca07/aSpy).*

