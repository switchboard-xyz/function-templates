const core = require("@actions/core");
const github = require("@actions/github");
const fs = require("fs");
const path = require("path");
const zip = require("zip-a-folder");

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

  const artifacts = [];
  for await (const template of templates) {
    const inputDirectory = `./templates/${template}`;
    const outputZipFile = `./.artifacts/${template}.zip`;

    await zip.zip(inputDirectory, outputZipFile);

    const uploadAssetResponse = await octokit.repos.uploadReleaseAsset({
      url: uploadUrl,
      // Setup headers for API call, see Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset for more information
      headers: {
        "content-type": "application/tgz",
        "content-length": fs.statSync(outputZipFile).size,
      },
      name: template,
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
