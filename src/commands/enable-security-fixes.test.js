const nock = require("nock");
const { enableSecurityFixesForRepo } = require("./enable-security-fixes");

nock.disableNetConnect();

const repo = {
  name: "test-repo",
  owner: { login: "test-org" },
};

const nockSuccess = () => {
  nock("https://api.github.com")
    .put(`/repos/${repo.owner.login}/${repo.name}/automated-security-fixes`)
    .reply(204);
};

const nockFail = () => {
  // https://developer.github.com/v3/#abuse-rate-limits
  nock("https://api.github.com")
    .put(`/repos/${repo.owner.login}/${repo.name}/automated-security-fixes`)
    .reply(403, {
      message:
        "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.",
      documentation_url: "https://developer.github.com/v3/#abuse-rate-limits",
    });
};

afterEach(nock.cleanAll);
// https://github.com/nock/nock#memory-issues-with-jest
afterAll(nock.restore);

describe("enableSecurityFixesForRepo()", () => {
  test("enables successfully", () => {
    nockSuccess();
    return enableSecurityFixesForRepo(repo);
  });

  test("reflects a failure", () => {
    nockFail();

    const promise = enableSecurityFixesForRepo(repo);
    return expect(promise).rejects.toThrow(/abuse/);
  });
});
