// Import Node.js Dependencies
import path from "path";
import { fileURLToPath } from "url";

// Import Third-party Dependencies
import test from "tape";

// Import Internal Dependencies
import { SnykStrategy, hydratePayloadDependencies } from "../../src/strategies/snyk.js";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kFixturesDir = path.join(__dirname, "..", "fixtures");

/**
 * @param {test.Test} tape
 * @param {any} data
 */
function isAdvisory(tape, data) {
  // Assert property
  tape.true("source" in data, "advisory must have a 'source' property");
  tape.true("name" in data, "advisory must have a 'name' property");
  tape.true("dependency" in data, "advisory must have a 'dependency' property");
  tape.true("title" in data, "advisory must have a 'title' property");
  tape.true("url" in data, "advisory must have a 'url' property");
  tape.true("severity" in data, "advisory must have a 'severity' property");
  tape.true("range" in data, "advisory must have a 'range' property");
}

test("SnykStrategy definition must return only two keys.", (tape) => {
  const definition = SnykStrategy();

  tape.strictEqual(definition.strategy, "snyk", "strategy property must equal 'snyk'");
  tape.deepEqual(Object.keys(definition).sort(), ["strategy", "hydratePayloadDependencies"].sort());

  tape.end();
});

test("snyk strategy: hydratePayloadDependencies", async(tape) => {
  const dependencies = new Map();
  dependencies.set("@npmcli/git", { vulnerabilities: [] });

  await hydratePayloadDependencies(dependencies, {
    path: path.join(kFixturesDir, "audit")
  });

  tape.strictEqual(dependencies.size, 1, "hydratePayloadDependencies must not add new dependencies by itself");
  const { vulnerabilities } = dependencies.get("@npmcli/git");
  tape.strictEqual(vulnerabilities.length, 1);

  isAdvisory(tape, vulnerabilities[0]);
  tape.deepEqual(vulnerabilities[0], {
    source: 1772,
    name: "@npmcli/git",
    dependency: "@npmcli/git",
    title: "Arbitrary Command Injection due to Improper Command Sanitization",
    url: "https://npmjs.com/advisories/1772",
    severity: "moderate",
    range: "<2.0.8",
    version: undefined,
    id: undefined,
    vulnerableVersions: undefined
  });

  tape.end();
});
