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

afterEach(nock.cleanAll);
// https://github.com/nock/nock#memory-issues-with-jest
afterAll(nock.restore);

describe("enableSecurityFixesForRepo()", () => {
  test("enables successfully", () => {
    nockSuccess();
    return enableSecurityFixesForRepo(repo);
  });
});
