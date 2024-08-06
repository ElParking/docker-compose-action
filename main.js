const  { v2 } = require("docker-compose");
const core = require("@actions/core");
const utils = require("./utils");
//const path = require("path");

try {
  const composeFiles = utils.parseComposeFiles(
    core.getMultilineInput("compose-file")
  );
  if (!composeFiles.length) {
    return;
  }

  const services = core.getMultilineInput("services", { required: false });

  const options = {
    config: composeFiles,
    log: true,
    composeOptions: utils.parseFlags(core.getInput("compose-flags")),
    commandOptions: utils.parseFlags(core.getInput("up-flags")),
  };

  const promise =
    services.length > 0
      ? v2.upMany(services, options)
      : v2.upAll(options);

  promise
    .then(() => {
      console.log("compose started");

      // Run tests command.

      const testContainer = core.getInput("test-container");
      const testCommand = core.getInput("test-command");

      console.log("testContainer", testContainer);
      console.log("testCommand", testCommand);

      if (testCommand && testContainer) {
        setTimeout(() => {
          const test = v2.exec(testContainer, testCommand, {
            config: composeFiles,
          });

          test
            .then((out) => {
              console.log(out.out);
              console.log("tests passed");
            })
            .catch((err) => {
              console.log(err.out);
              console.log(err.err);
              core.setFailed(`tests failed ${JSON.stringify(err)}`);
            });
        }, 10000);
      }
    })
    .catch((err) => {
      core.setFailed(`compose up failed ${JSON.stringify(err)}`);
    });
} catch (error) {
  core.setFailed(error.message);
}
