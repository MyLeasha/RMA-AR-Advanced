RMA Compliance AR - Full AR experience (version 3.1.0)

Upload the CONTENTS of this folder (not the folder itself) into the existing LMS folder
that the QR code opens:
https://lms.randmutual.co.za/files/RMA_Compliance%20AR%20Experience_V1.00_260317/

Replace the old index.html. Keep the folder name unchanged, because the printed QR code points to it.

Files
  index.html      Loader page opened by the QR code. Rarely changes.
  version.json    Current version number. Raise it with every update.
  web.config      IIS settings: caching rules and file types (.glb, .mind, .json).
  app/content.js  Course buttons: labels, sizes and LMS links. Edit this file when courses change.
  app/app.js      Builds the AR scene.
  lib/            A-Frame 1.5.0 and MindAR 1.2.5 libraries.
  assets/         3D city model, medal badge and image-tracking target.

The full process (first-time setup, updates, testing, troubleshooting) is in the
"RMA Compliance AR - V3 Deployment Guide".
