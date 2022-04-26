// Import Third-party Dependencies
import * as httpie from "@myunisoft/httpie";

// CONSTANTS
export const kHttpClientHeaders = {
  headers: { "content-type": "application/json" }
};

export function setupHttpAgentMock() {
  const httpDispatcher = httpie.getGlobalDispatcher();
  const mockedHttpAgent = new httpie.MockAgent();

  mockedHttpAgent.disableNetConnect();
  httpie.setGlobalDispatcher(mockedHttpAgent);

  return [
    mockedHttpAgent,
    () => {
      mockedHttpAgent.enableNetConnect();
      httpie.setGlobalDispatcher(httpDispatcher);
    }
  ];
}

// eslint-disable-next-line id-length
export function isNodeSecureStandardVulnerabilityPayload(tape, payload) {
  const mandatoryStandardFormatKeys = [
    "origin",
    "package",
    "title",
    "vulnerableVersions",
    "vulnerableRanges",
    "cves"
  ];

  // Check that the mandatory properties are present in the payload
  mandatoryStandardFormatKeys.forEach((standardProperty) => {
    tape.true(
      standardProperty in payload,
      `the payload is missing the '${standardProperty}' standard property`
    );
  });

  const optionalStandardFormatKeys = [
    "id",
    "url",
    "description",
    "severity",
    "cvssVector",
    "cvssScore",
    "patches",
    "patchedVersions"
  ];

  // Check that every other property of the payload is part of the optional
  // properties (sort of schema validation) or part of the standard format
  Object.keys(payload).forEach((payloadProperty) => {
    // Mandatory properties were already verified so we don't want to check it again
    if (!mandatoryStandardFormatKeys.includes(payloadProperty)) {
      tape.true(
        optionalStandardFormatKeys.includes(payloadProperty),
        `the payload contains '${payloadProperty}' property which is not standard compliant`
      );
    }
  });
}
