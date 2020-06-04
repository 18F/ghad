import nock from "nock";
import { enableSecurityAlertsForRepo } from "./enable-security-alerts";
import { repo } from "../lib/test-helper";

nock.disableNetConnect();

const nockSuccess = () => {
  nock("https://api.github.com")
    .put(`/repos/${repo.owner.login}/${repo.name}/vulnerability-alerts`)
    .reply(204);
};

const nockFail = () => {
  // https://developer.github.com/v3/#abuse-rate-limits
  nock("https://api.github.com")
    .put(`/repos/${repo.owner.login}/${repo.name}/vulnerability-alerts`)
    .reply(403, {
      message:
        "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.",
      documentation_url: "https://developer.github.com/v3/#abuse-rate-limits",
    });
};

afterEach(nock.cleanAll);
// https://github.com/nock/nock#memory-issues-with-jest
afterAll(nock.restore);

describe("enableSecurityAlertsForRepo()", () => {
  test("enables successfully", () => {
    nockSuccess();
    return enableSecurityAlertsForRepo(repo);
  });

  test("reflects a failure", () => {
    nockFail();

    const promise = enableSecurityAlertsForRepo(repo);
    return expect(promise).rejects.toThrow(/abuse/);
  });
});
