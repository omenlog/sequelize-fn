const fs = require("fs");
const Sequelize = require("sequelize");
const pipe = require("crocks/helpers/pipe");
const getPathOr = require("crocks/helpers/getPathOr");
const IO = require("crocks/IO");
const tap = require("crocks/helpers/tap");
const getPath = require("crocks/Maybe/getPath");
const path = require("path");
const either = require("crocks/pointfree/either");
const map = require("crocks/pointfree/map");
const run = require("crocks/pointfree/run");
const tryCatch = require("crocks/Result/tryCatch");
const converge = require("crocks/combinators/converge");
const identity = require("ramda/src/identity");
const when = require("ramda/src/when");
const forEach = require("ramda/src/forEach");
const isDefined = require("crocks/predicates/isDefined");

const error = message => e => {
  console.log(message);
  console.log("\n");
  isDefined(e) && console.log(e);
  process.exit(0);
};

const getSequelizeOptions = getPathOr({}, ["sequelize", "options"]);
const getSequelizeUri = pipe(
  getPath(["sequelize", "dataBaseUri"]),
  either(error("Sequelize Uri Missing"), identity)
);

const createSequelizeInstance = (dataBaseUri, options = {}) =>
  new Sequelize(dataBaseUri, options);

const initSequelize = converge(
  createSequelizeInstance,
  getSequelizeUri,
  getSequelizeOptions
);

// readModelsFiles :: String -> IO([String])
const readModelsFiles = location =>
  IO.of(() => tryCatch(() => fs.readdirSync(location))());

const getModelsDir = pipe(
  getPath(["sequelize", "modelsDir"]),
  either(error("Invalid Models Configuration"), identity)
);

const buildModelsPaths = modelsDir =>
  map(modelName => path.join(modelsDir, modelName));

// getModelsDefinition :: String -> IO ([String])
const getModelsDefinitions = modelsDir =>
  pipe(
    readModelsFiles,
    map(fn =>
      pipe(
        fn,
        either(error("Error Reading models"), buildModelsPaths(modelsDir))
      )
    )
  )(modelsDir);

// getModels :: Object -> IO([String])
const getModels = pipe(getModelsDir, getModelsDefinitions);

// importModels :: Seq s => (s, IO([String])) -> IO(s)
const importModels = (sequelize, modelsDefinitions) =>
  modelsDefinitions.map(fn => () => {
    forEach(model => sequelize.import(model), fn());
    return sequelize;
  });

const importer = (config, afterFn = identity) =>
  pipe(
    converge(importModels, initSequelize, getModels),
    map(fn => pipe(fn, afterFn)),
    run,
    seqIO => (config.sequelize.lazy === true ? seqIO : seqIO())
  )(config);

const sequelize = importer({
  sequelize: {
    modelsDir: "C:\\Users\\omar.lopez\\Projects\\models-importer\\models",
    dataBaseUri: "mysql://root:password@lsocalhost/test"
  }
});

console.log(sequelize.models);
