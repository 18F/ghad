const { processRepos } = require("./repos");

const repo = {
  name: "test-repo",
  owner: { login: "test-org" },
};

describe("processRepos()", () => {
  test("runs across repositories", () => {
    const fn = () => Promise.resolve("foo");
    const promise = processRepos([repo], fn, true);
    return expect(promise).resolves.toEqual(["foo"]);
  });

  test("reflects a failure", () => {
    const fn = () => Promise.reject("foo");
    const promise = processRepos([repo], fn, true);
    return expect(promise).rejects.toEqual("foo");
  });
});
