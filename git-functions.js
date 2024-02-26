const childProcess = require("child_process");

module.exports.isReleaseVersion = () => {
    const bname = childProcess
        .execSync("git symbolic-ref -q HEAD")
        .toString()
        .replace("refs/heads/", "")
        .trim()
        .toLowerCase();

    console.log(`Build for HEAD ${  bname}`);

    return bname === "master" || bname.match(/^\d+\.\d+\.\d+$/g);
};
