"use strict";

const importer = require("./");
const { runAssociations } = require("./");
const fs = require("fs");

jest.mock("sequelize");
jest.mock("fs");

describe("Sequelize Importer", () => {
  beforeAll(() => {
    const MOCK_FILES = {
      ["/path/to/models/user.js"]: "user.js",
      ["/path/to/models/user.map"]: "user.map",
      ["/path/to/models/user.ts"]: "user.ts"
    };

    fs.__setMockFiles(MOCK_FILES);
  });

  test("It throw when sequelize keys is not defined in the config", () => {
    expect(() => importer()).toThrow();
  });

  test("It throw when database uri is not defined", () => {
    expect(() => importer({ sequelize: {} })).toThrow();
  });

  test("It throw when modelsDir is not specified", () => {
    expect(() => importer({ sequelize: { dataBaseUri: "test" } })).toThrow();
  });

  test("It import the correct ammount of models", () => {
    const seqInstance = importer({
      modelsDir: "/path/to/models",
      dataBaseUri: "mysql://root:password@lsocalhost/test"
    });

    expect(seqInstance.import.mock.calls.length).toBe(1);
  });

  test("It can have a lazy behavior configured by the user", () => {
    const seqInstance = importer({
      lazy: true,
      modelsDir: "/path/to/models",
      dataBaseUri: "mysql://root:password@lsocalhost/test"
    });

    expect(typeof seqInstance).toBe("function");
  });

  test("It executing asynchronously the function that you passed as second argument", () => {
    const seqConfig = {
      modelsDir: "/path/to/models",
      dataBaseUri: "mysql://root:password@lsocalhost/test"
    };

    /* This function return sequelize instance as argument and return in and automatic way */
    const afterFn = seq => {
      seq.executed = true;
    };

    const result = importer(seqConfig, afterFn);

    expect(result.executed).toBeTruthy();
  });

  test("it run associations correctlty", done => {
    const sequelize = {
      models: {
        Users: {
          associate: models => {
            expect(models.Teams).toBeDefined();
            done();
          }
        },
        Teams: {}
      }
    };

    runAssociations(sequelize);
  });
});
