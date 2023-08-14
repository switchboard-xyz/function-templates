const core = require("@actions/core");
const github = require("@actions/github");
const child_process = require("child_process");
const fs = require("fs");
const path = require("path");

async function run() {
  const octokit = github.getOctokit(
    core.getInput("gh-token", { required: true })
  );

  const tagName = core.getInput("tag-name", { required: true });
  console.log(`TagName: ${tagName}`);

  const uploadUrl = core.getInput("upload-url", { required: true });
  console.log(`UploadUrl: ${uploadUrl}`);

  const templates = fs
    .readdirSync("./templates", { encoding: "utf-8" })
    .filter((f) => fs.statSync(`./templates/${f}`).isDirectory());
  console.log(`Templates: \n\t - ${templates.join("\n\t - ")}`);

  fs.mkdirSync(".artifacts");

  const workingDir = process.cwd();

  const artifacts = [];
  for await (const template of templates) {
    const inputDirectory = `./templates/${template}/`;
    const outputZipFile = path.join(workingDir, `./.artifacts/${template}.zip`);

    const result = child_process.execSync(`zip -TFFr ${outputZipFile} .`, {
      cwd: inputDirectory,
      encoding: "utf-8",
    });
    console.log(`Zip Result: ${result}`);

    const uploadAssetResponse = await octokit.rest.repos.uploadReleaseAsset({
      url: uploadUrl,
      // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
      headers: {
        "content-type": "application/zip",
        "content-length": fs.statSync(outputZipFile).size,
      },
      name: `${template}.zip`,
      file: fs.readFileSync(outputZipFile),
    });

    // Get the browser_download_url for the uploaded release asset from the response
    const {
      data: { browser_download_url: browserDownloadUrl },
    } = uploadAssetResponse;

    artifacts.push(browserDownloadUrl);
  }

  core.setOutput("artifacts", artifacts);

  // // Get the JSON webhook payload for the event that triggered the workflow
  // const payload = JSON.stringify(github.context.payload, undefined, 2);
  // console.log(`The event payload: ${payload}`);
}

run().catch((error) => {
  core.setFailed(error.message);
});
