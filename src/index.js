const fs = require("fs");
const Sequelize = require("sequelize");
const pipe = require("crocks/helpers/pipe");
const getPath = require("crocks/Maybe/getPath");
const path = require("path");
const either = require("crocks/pointfree/either");
const map = require("crocks/pointfree/map");
const tryCatch = require("crocks/Result/tryCatch");
const converge = require("crocks/combinators/converge");
const identity = require("ramda/src/identity");
const forEach = require("ramda/src/forEach");

const initSequelize = config =>
  new Sequelize(config.sequelize.dataBaseUri, config.sequelize.options);

// readModelsFiles :: String -> [String]
const readModelsFiles = location => tryCatch(() => fs.readdirSync(location))();

const error = message => e => {
  console.log(`${message}\n${e}`);
  process.exit(0);
};

const getModelsDir = pipe(
  getPath(["sequelize", "modelsDir"]),
  either(error("Invalid Models Configuration"), identity)
);

const buildModelsPaths = modelsDir =>
  map(modelName => path.join(modelsDir, modelName));

// getModelsDefinition :: Object -> [String]
const getModelsDefinitions = modelsDir =>
  pipe(
    readModelsFiles,
    either(error("Error Reading models"), buildModelsPaths(modelsDir))
  )(modelsDir);

const getModels = pipe(
  getModelsDir,
  getModelsDefinitions
);

const importModels = (sequelize, modelsDefinitions) => {
  forEach(model => sequelize.import(model), modelsDefinitions);
  return sequelize;
};

const importer = converge(importModels, initSequelize, getModels);

const seq = importer({
  sequelize: {
    modelsDir: "C:\\Users\\omar.lopez\\Projects\\models-importer\\models",
    dataBaseUri: "mysql://root:password@lsocalhost/test",
    options: { dialect: "mysql" }
  }
});

console.log(seq.models);
