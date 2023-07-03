![Logo of the project](header.png)

# ARtefact

ARtefact is a framework for displaying 3D models, adding annotations and connecting content to them. It is developed at the [German Maritime Museum](https://dsm.museum) and built with three.js and Quasar.

> If you encounter any problems adding your own 3D models or content, feel free to message us on GitHub.

## Features

- Show your 3D models in an interactive viewer
- Play an animation
- Add additional content in annotation and a special info layer
- Create a quiz for your visitors

## Installing / Getting started

Install the dependencies needed to run the project

```bash
npm install
```

## Developing

Start the dev server on port 8080.
The app is then available via [http://localhost:8080](http://localhost:8080)

To configure https, see [these instructions](https://quasar.dev/quasar-cli-vite/developing-pwa/handling-service-worker#ssl-certificate).

```bash
quasar dev
```

## Building

Build the app for deploying it on a server

```bash
quasar build -m pwa
```

The app will be built to `dist/pwa`

## Configuration

You can add your own model and content by supplying the app with a text file that configures the model and corresponding media files like images and videos. They will be used to build a new page and add it to the model list.

For a basic setup you will only need a folder, the 3d model you want to show and the config.json file

Every model and its files are placed in an own folder inside of `src/models`. To add a new model to the app, create a new folder and place the files there.

If you have a model named `MyShip`, the folder could look like this:

```
📂 src/models/
└── 📂 MyShip/
    ├── model.glb
    ├── config.json
    └── 📂 media/
        ├── 🖼️ thumbnail.jpg
        ├── 🖼️ interior.jpg
        ├── 🖼️ work.png
        ├── 🖼️ icon-about.png
        ├── 🎞️ interior.mp4
        ├── 🎞️ exterior.mp4
        └── [...]
```

For every model, the app needs a config file specifying the model file, annotations and more. See the `src/models/example/config.json` file for an extended version:

```json
{
  "title": "My Ship",
  "model": "model.glb",
  "annotations": [
    {
      "id": "first-annotation",
      "icon": "media/icon-about.png",
      "position": [1.0, 0.6, 2.4],
      "media": "media/interior.jpg",
      "content": [
        "This is the annotation",
        "with multiple paragraphs of",
        "Content."
      ]
    }
  ]
}
```

## Branding

To change the apps appearance to fit your corporate design, you can change logos, fonts, colors and more. For more information, see also [Quasar - Adding your own colors](https://quasar.dev/style/color-palette#adding-your-own-colors).

### Colors

To change the colors, change the variables in `src\css\quasar.variables.scss`:

```css
$primary: #002c50;
$secondary: #699da8;
$accent: #9c27b0;

$dark: #1d1d1d;

$positive: #21ba45;
$negative: #c10015;
$info: #31ccec;
$warning: #f2c037;
```

### Font

You can change the font in `src\css\app.scss`.

Montserrat is used as the default font for normal and bold font styles:

```css
// Montserrat as an OFL example
@font-face {
  font-family: Montserrat;
  src: url(./fonts/Montserrat-Regular.ttf);
  font-weight: normal;
}

@font-face {
  font-family: Montserrat;
  src: url(./fonts/Montserrat-SemiBold.ttf);
  font-weight: bold;
}
```

### App name and icon

To change the name and icon of the Progressive Web App, change the `manifest` section of the `quasar.conf.js` file:

```js
manifest: {
  name: `My App`,
  short_name: `App`,
  description: `View our 3d models in our Progressive Web App`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#ffffff',
  start_url: './',
  scope: './',
  theme_color: '#002c50', // this colors in elements of the OS and browser
  icons: [
    {
      src: 'icons/icon-128x128.png', // swap these files to change the icon
      sizes: '128x128',
      type: 'image/png',
    },
    ...
  ]
},
...
```

## Licensing

The code in this project is licensed under MIT license.
