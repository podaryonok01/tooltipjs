import childProcess from "child_process";

export const isReleaseVersion = () => {
    const bname = childProcess
        .execSync("git symbolic-ref -q HEAD")
        .toString()
        .replace("refs/heads/", "")
        .trim()
        .toLowerCase();

    console.log(`Build for HEAD ${  bname}`);

    return bname === "master" || bname.match(/^\d+\.\d+\.\d+$/g);
};
