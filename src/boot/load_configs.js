// Load the config files for the models
const modelconfigs = {}

export default ({ app }) => {
  const files = require.context('/public/models/', true, /\.json$/)

  files.keys().forEach((key) => {
    // get the folder name (the urlPath)
    /*const folderName = key
      .split('/')
      .pop()
      .replace(/(\.\/|\.json)/g, '')*/

    const fileData = files(key)

    // "./example/config.json ==> "[ ".", "example", "config.json" ]
    const urlPath = key.split('/')

    // also add the urlPath ("example") to the fileData Object
    fileData['urlPath'] = urlPath[1] // "example"

    modelconfigs[urlPath[1]] = fileData
  })

  // Add the data object to the app
  app.config.globalProperties.$modelconfigs = modelconfigs
}

export { modelconfigs }
