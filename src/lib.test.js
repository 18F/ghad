const octokit = require("./client");
const { getLatestEvent, shouldBeArchived } = require("./lib");

jest.mock("./client");

describe("getLatestEvent()", () => {
  test("filters external events", async () => {
    octokit.activity.listRepoEvents.mockResolvedValue({
      data: [{ type: "ForkEvent" }, { type: "OtherEvent" }]
    });

    const repo = {
      name: "test-repo",
      owner: { login: "test-org" }
    };
    const event = await getLatestEvent(repo);
    expect(event.type).toBe("OtherEvent");
  });
});

describe("shouldBeArchived()", () => {
  test("excludes repositories that are explicitly 'deprecated'", async () => {
    const repo = { description: "DEPRECATED for reasons unknown" };
    const result = await shouldBeArchived(repo);
    expect(result).toBe(true);
  });
});
