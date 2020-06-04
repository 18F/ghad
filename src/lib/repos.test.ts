import { processRepos } from "./repos";
import { repo } from "./test-helper";

describe("processRepos()", () => {
  test("runs across repositories", async () => {
    const fn = () => Promise.resolve("foo");
    const results = await processRepos([repo], fn, true);
    expect(results).toEqual(["foo"]);
  });

  test("reflects a failure", () => {
    const fn = () => Promise.reject("foo");
    const promise = processRepos([repo], fn, true);
    return expect(promise).rejects.toEqual("foo");
  });
});
