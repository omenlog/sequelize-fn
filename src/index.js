const Sequelize = require("sequelize");
const State = require("crocks/State");
const pipe = require("crocks/helpers/pipe");
const Pair = require("crocks/Pair");

const getState = () => State(s => Pair(s, s));

function mapper(s) {
  console.log(s);
  return s + 10;
}

const buildSequelize = config =>
  getState()
    .map(config => new Sequelize(config.dataBaseUri, config.options))
    .runWith(config);

const getModels = s => console.log(s.fst().sync());

const logger = s => console.log(`State: ${s.snd()} Value: ${s.fst()}`);

const test = pipe(
  buildSequelize,
  getModels
);

test({
  dataBaseUri: "mysql://root:password@lsocalhost/test",
  options: { dialect: "mysql" }
});
