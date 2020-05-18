const nock = require("nock");
const { enableSecurityAlertsForRepo } = require("./enable-security-alerts");

nock.disableNetConnect();

const repo = {
  name: "test-repo",
  owner: { login: "test-org" },
};

const nockSuccess = () => {
  nock("https://api.github.com")
    .put(`/repos/${repo.owner.login}/${repo.name}/vulnerability-alerts`)
    .reply(204);
};

afterEach(nock.cleanAll);
// https://github.com/nock/nock#memory-issues-with-jest
afterAll(nock.restore);

describe("enableSecurityAlertsForRepo()", () => {
  test("enables successfully", () => {
    nockSuccess();
    return enableSecurityAlertsForRepo(repo);
  });
});
