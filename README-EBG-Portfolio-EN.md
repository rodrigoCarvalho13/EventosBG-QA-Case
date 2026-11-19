# EBG | Automated Testing with Cypress

An end-to-end test automation project developed for **EBG**, focused on software quality, critical user flows, and access-control behavior related to events, game spaces, shops, and organizer groups.

This repository brings together test scenarios traceable to the original test case IDs (TCs) defined in the project's test matrix. The implementation follows the existing Cypress conventions, uses selectors grounded in the application source, and clearly distinguishes implemented tests, static checks, and scenarios that still depend on environment setup or business decisions.

> **Delivery status:** specs TC-10 through TC-13 are included in the current implementation package. This does not mean that every scenario has been executed or passed at runtime. See [Status and limitations](#status-and-limitations).

---

## Project goals

- Automate relevant EBG functional flows using Cypress.
- Preserve traceability between automated tests and the original test case IDs (TC-10, TC-11, etc.).
- Verify form validation, record creation and editing, public visibility, and access control.
- Help prevent regressions in critical application flows.
- Document preconditions, test data, and execution limitations.
- Avoid real credentials, unauthorized data changes, and success claims without execution evidence.

## Technologies and approach

- **Base44** — backend project developed for testing data.
- **Cypress** — end-to-end test automation.
- **JavaScript** — test spec implementation.
- **EBG** — application under test.
- **Notion CSV export** — source for the test case matrix and required flows.

The specs follow the structure and conventions already present in the project's Cypress suite. Selectors are based on elements identified in the application rather than assumed attributes or unverified behavior.

## Automated test scope in this delivery

| Test case | Coverage | What is verified |
|---|---|---|
| **TC-10 — Create and edit an event** | Event creation and editing | Required-field validation, controlled creation, public listing visibility, and owner editing. |
| **TC-11 — Create spaces, shops, and groups** | Registration of game spaces, shops, and groups | Correct form selection, specific fields, controlled creation, and visibility in the relevant directories. |
| **TC-12 — Ownership and access boundaries** | Ownership and access control | Owners can access their own records, cross-account editing is denied, and unauthenticated visitors are redirected. |
| **TC-13 — Anonymous event suggestion** | Anonymous event suggestion | Access without login, submitter name/email validation, UI success/error states, and the function request contract. |

### Test traceability

The original TC IDs are preserved in the spec filenames:

```text
cypress/
└── e2e/
    ├── TC-10-create-and-edit-event.cy.js
    ├── TC-11-create-spaces-shops-and-groups.cy.js
    ├── TC-12-ownership-and-access-boundaries.cy.js
    └── TC-13-anonymous-event-suggestion.cy.js
```

Internal scenario names also retain their corresponding TC identifiers, making it easier to compare the automated suite with the original test matrix.

## Prerequisites

To run the tests, you need:

- Node.js and npm installed.
- Project dependencies installed.
- Cypress available in the project dependencies.
- The EBG application running in a local or authorized test environment.
- For authenticated scenarios, preconfigured test accounts and records.
- For scenarios that create records, explicit write authorization and a known cleanup procedure.

The default application URL used by the specs is `http://localhost:5173`. It can be overridden using the environment variables described below.

## Installation

From the project root:

```bash
npm install
```

If the repository contains an up-to-date `package-lock.json`, prefer a reproducible installation:

```bash
npm ci
```

Make sure the EBG application is running before starting the tests. Commands to start the frontend and backend depend on the project configuration and should be checked in `package.json` and the application documentation.

## Running the tests

Run all Cypress specs:

```bash
npx cypress run
```

Open the interactive Cypress interface:

```bash
npx cypress open
```

Run an individual test case:

```bash
npx cypress run --spec "cypress/e2e/TC-10-create-and-edit-event.cy.js"
npx cypress run --spec "cypress/e2e/TC-11-create-spaces-shops-and-groups.cy.js"
npx cypress run --spec "cypress/e2e/TC-12-ownership-and-access-boundaries.cy.js"
npx cypress run --spec "cypress/e2e/TC-13-anonymous-event-suggestion.cy.js"
```

Run these commands from the project root, where the Cypress configuration is located.

## Test data configuration

The specs use Cypress environment variables to avoid storing credentials and record IDs directly in the source code.

### TC-10 — Create and edit an event

| Variable | Purpose |
|---|---|
| `TC10_BASE_URL` | Application base URL. Defaults to `http://localhost:5173`. |
| `TC10_OWNER_EMAIL` | Test owner account email. |
| `TC10_OWNER_PASSWORD` | Test owner account password. |
| `TC10_ALLOW_WRITES` | Must be `true` to enable the data-writing scenario. |
| `TC10_CLEANUP` | Must be `true` to enable the cleanup behavior included in the spec. |

### TC-11 — Create spaces, shops, and groups

| Variable | Purpose |
|---|---|
| `TC11_BASE_URL` | Application base URL. Defaults to `http://localhost:5173`. |
| `TC11_OWNER_EMAIL` | Test owner account email. |
| `TC11_OWNER_PASSWORD` | Test owner account password. |
| `TC11_ALLOW_WRITES` | Must be `true` to enable scenarios that write data. |
| `TC11_CLEANUP` | Must be `true` to enable the cleanup behavior included in the spec. |

### TC-12 — Ownership and access boundaries

| Variable | Purpose |
|---|---|
| `TC12_BASE_URL` | Application base URL. Defaults to `http://localhost:5173`. |
| `TC12_OWNER_A_EMAIL` / `TC12_OWNER_A_PASSWORD` | Credentials for test account A. |
| `TC12_OWNER_A_EVENT_ID` | ID of the event owned by account A. |
| `TC12_OWNER_A_SHOP_ID` | ID of the shop/game-space listing owned by account A. |
| `TC12_OWNER_B_EMAIL` / `TC12_OWNER_B_PASSWORD` | Credentials for test account B. |
| `TC12_OWNER_B_EVENT_ID` | ID of the event owned by account B. |
| `TC12_OWNER_B_SHOP_ID` | ID of the shop/game-space listing owned by account B. |

TC-12 requires two distinct regular user accounts and four existing records that remain available throughout the test run. The spec skips its scenarios when required values are missing.

### TC-13 — Anonymous event suggestion

| Variable | Purpose |
|---|---|
| `TC13_BASE_URL` | Application base URL. Defaults to `http://localhost:5173`. |

TC-13 uses request interception for its success and error scenarios. These tests verify the UI contract and do not create persistent suggestions in the backend.

### Providing environment variables

Set values through the team's approved local secret-management mechanism or Cypress environment configuration. Do not commit passwords, tokens, cookies, personal data, or local secret files.

**Do not use production accounts.** Tests that write data must only run in an authorized environment and use synthetic test data.

## Quality practices

- Original TC IDs are preserved in spec filenames and test descriptions.
- Selectors are aligned with elements present in the application.
- Credentials are provided through environment variables rather than hardcoded values.
- Data-writing tests are protected by explicit opt-in flags.
- Anonymous suggestion scenarios use intercepted responses when real persistence is not authorized or configured.
- Access control is checked through both public navigation and direct requests to protected routes.
- `it.only()` usage is reviewed to prevent accidental isolation of tests from the full suite.
- Preconditions and blockers are documented without treating missing execution as a passing result.

## Status and limitations

| Item | Current known status |
|---|---|
| TC-10 through TC-13 specs | Implemented in the current cumulative package. |
| JavaScript syntax checks | Reported as passing in the implementation deliveries. |
| `it.only()` review | A patch was prepared to remove four occurrences identified in the original project. |
| Cypress end-to-end execution | Not confirmed in the current deliveries. |
| TC-13 integration with real persistence and public visibility | Pending an available staging environment and an approved cleanup procedure. |
| TC-14 — Moderator suggestion review | Blocked by pending business-rule decisions and test prerequisites. |
| TC-15 through TC-22 | Not documented as implemented in this delivery. |

### Important interpretation notes

- **Implemented** means the spec has been written; it does not mean it has passed during execution.
- **Static validation** checks JavaScript syntax, not application behavior.
- TC-13 scenarios using intercepted responses verify simulated responses and UI behavior. They do not prove that a suggestion was persisted with `pending` status in the backend.
- TC-14 was not implemented because the moderation policy and some requested behaviors still require confirmation. Tests for unconfirmed functionality were not invented.
- A test run that skips scenarios because environment variables or test data are missing must not be reported as a pass.

## Security and GitHub publication

Before publishing this repository:

1. Remove or replace credentials, tokens, cookies, private IDs, and personal data.
2. Check that `.env` files, reports containing sensitive data, and local configuration files are included in `.gitignore`.
3. Use only synthetic data and authorized test environments.
4. Review configuration files to ensure that no internal URLs or secrets are exposed.
5. Confirm that publishing the source code and related artifacts is authorized.

This README describes the automation and documented coverage. It does not claim that the application, its services, or all scenarios have been validated in production.

## Next steps

- Unblock TC-14 by confirming the moderation policy and providing authorized test data.
- Implement the remaining applicable cases from the test matrix, preserving their order and traceability.
- Execute the specs in a controlled environment with dependencies and services available.
- Record execution evidence (logs, screenshots, or videos) without exposing sensitive data.
- Update this documentation as coverage is implemented and actually executed.

---

**QA / Test Automation Portfolio Project**  
Cypress E2E Automation | JavaScript | Functional Testing | Requirements Traceability
