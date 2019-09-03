const octokit = require("./client");
const { getLatestEvent, hasDeprecationText } = require("./lib");

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

describe("hasDeprecationText()", () => {
  test.each([
    ["DEPRECATED for reasons unknown", true],
    ["not supported", true],
    ["No Longer Supported", true],
    ["other description", false]
  ])(
    "repositories with a description of '%s'",
    (description, shouldArchive) => {
      const result = hasDeprecationText(description);
      expect(result).toBe(shouldArchive);
    }
  );
});
