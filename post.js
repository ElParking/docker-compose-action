const  { v2 } = require("docker-compose");
const core = require("@actions/core");
const utils = require("./utils");

try {
  const composeFiles = utils.parseComposeFiles(
    core.getMultilineInput("compose-file")
  );
  if (!composeFiles.length) {
    return;
  }

  const options = {
    config: composeFiles,
    log: true,
    composeOptions: utils.parseFlags(core.getInput("compose-flags")),
    commandOptions: utils.parseFlags(core.getInput("down-flags")),
  };

  v2.down(options).then(
    () => {
      console.log("compose removed");
    },
    (err) => {
      core.setFailed(`compose down failed ${err}`);
    }
  );
} catch (error) {
  core.setFailed(error.message);
}
