# SauceDemo DSL Testing Project

## 1. Project Overview

This project demonstrates a small model-based testing DSL (domain-specific language) for the SauceDemo shopping application. Test scenarios are written as meaningful customer actions followed by expected, observable application perceptions. A TypeScript interpreter translates those DSL steps into Playwright browser interactions and assertions.

The project focuses on understandable, reusable end-to-end scenarios rather than exposing CSS selectors or browser mechanics to test authors.

## 2. Team Members


- **Members:** NGUYEN Minh Huy (12223977)
- **Course / group:** IHM Group 1


## 3. Application Under Test

- **Application:** SauceDemo
- **Default URL:** `https://www.saucedemo.com`
- **Scope:** Authentication, product discovery and sorting, product inspection, cart selection and modification, checkout information validation, order overview and confirmation, navigation, logout and protected-page access.
- **Test accounts:** `standard_user` for successful journeys and `locked_out_user` for the locked-account scenario. The default password is `secret_sauce`; credentials can be overridden using environment variables.

The application is a third-party demo site. Tests require network access and should be run against the intended SauceDemo environment.

## 4. Testing Strategy

The test suite combines complementary techniques. Scenario priorities follow the supplied risk assessment: P0 is business-critical, P1 is important, and P2 is useful supporting coverage. Effort is estimated relative to this project (Low / Medium / High).

### Functional coverage

**Why:** Confirms that key customer capabilities work across the application's main modules.

**Examples and scenarios:**
- Authentication: TC03 verifies locked-account rejection; TC07 verifies logout.
- Catalog and product interaction: TC08 verifies price sorting, product details and reset state.
- Cart management: TC05 adds three products, removes one, and checks that the remaining selection reaches checkout.
- Checkout and order lifecycle: TC01 and TC02 complete single- and multi-product purchases; TC04 checks field validation; TC06 checks cancellation.

**Risks covered:** Missing or broken controls, incorrect navigation, cart/order desynchronization, incorrect totals, and incomplete purchase journeys.

### Equivalence partitioning

**Why:** Inputs that should behave alike can be represented by a small number of valid and invalid classes instead of testing every possible value.

| Input | Class | Example | Expected result | Scenario |
|---|---|---|---|---|
| Login account | Valid, unlocked | `standard_user` with correct password | Inventory is displayed | TC01, TC02 |
| Login account | Locked | `locked_out_user` with correct password | Login is rejected with a locked-account message | TC03 |
| First name | Missing / non-empty | Empty / `Ada` | Empty value is rejected; non-empty value is accepted | TC04 |
| Last name | Missing / non-empty | Empty / `Lovelace` | Empty value is rejected; non-empty value is accepted | TC04 |
| Postal code | Missing / non-empty | Empty / `10001` | Empty value is rejected; non-empty value is accepted | TC04 |
| Cart selection | One / multiple / removed item | Backpack / Backpack + Bike Light / remove Bike Light | Cart and order contain exactly the remaining products | TC01, TC02, TC05 |

**Risks covered:** Authentication rule gaps, omitted required-field validation, and incorrect behavior for different selection sizes or states.

### Boundary value analysis

**Why:** Failures often occur at transitions such as empty versus populated forms or zero versus one selected item.

| Boundary | Test idea | Covered by |
|---|---|---|
| Required checkout fields: 0 fields entered | Submit all fields empty; verify the first missing field is reported | TC04 |
| Required checkout fields: 1 of 3 entered | Enter first name only and submit; verify last name is reported | TC04 |
| Required checkout fields: 2 of 3 entered | Enter first and last names; verify postal code is reported | TC04 |
| Required checkout fields: all 3 entered | Submit complete information and proceed | TC04, TC01 |
| Cart size: one product | Complete a single-item order | TC01 |
| Cart size: multiple products | Verify aggregation and total for two products | TC02 |
| Cart size after removal | Remove one from a three-product selection and verify two remain | TC05 |

The public demo does not define a business maximum for name or postal-code length; arbitrary length boundaries are therefore not asserted as product requirements.

### State transition testing

**Why:** Shopping is stateful. This technique checks that actions cause the correct state changes and that later pages reflect those changes.

| From | Action | Expected state | Scenario |
|---|---|---|---|
| Login page | Authenticate with standard account | Authenticated catalog | TC01, TC02 |
| Login page | Authenticate with locked account | Still unauthenticated, error visible | TC03 |
| Catalog | Add / remove product | Selection button and cart badge update | TC05, TC08 |
| Cart with products | Remove one product | Row and badge count decrease | TC05 |
| Populated cart | Cancel checkout | Cart returns with selection intact | TC06 |
| Checkout information | Submit invalid / valid values | Error remains / order overview opens | TC04 |
| Order overview | Finish | Purchase confirmation opens | TC01, TC02 |
| Authenticated catalog | Logout, then request inventory | Login page shown; protected content unavailable | TC07 |
| Catalog with selected product | Reset application state | Cart badge disappears and selection is cleared | TC08 |

**Risks covered:** Lost state, stale cart contents, broken page transitions, incorrect session handling and unauthorized access.

### End-to-end testing

**Why:** A complete journey exposes integration failures that isolated page checks cannot detect.

| Scenario | Priority | Effort | Journey | Main risks |
|---|---|---|---|---|
| TC01 / E2E01 — single-product purchase | P0 | Medium | Login → select Backpack → cart → checkout → verify subtotal → finish | Broken module integration, lost cart contents, incorrect checkout transition or purchase failure |
| TC02 / E2E02 — multi-product purchase | P0 | Medium | Select Backpack and Bike Light → checkout → verify products and arithmetic → finish | Duplicate/missing products, aggregation and calculation defects |
| TC03 / E2E03 — locked-account login | P0 | Low | Open login → use locked account → verify rejection | Incorrect account-state handling or unauthorized access |
| TC04 / E2E04 — checkout validation and recovery | P0 | Medium | Submit missing fields in turn → complete form → proceed | Missing validation, incorrect error feedback or inability to recover |
| TC05 / E2E05 — cart modification | P1 | Medium | Add three → remove one → verify two remain through overview | Cart synchronization, wrong removal or stale order contents |
| TC06 / E2E06 — cancel checkout | P1 | Low | Add product → checkout → cancel → verify selection remains | Unexpected data loss or wrong cancellation navigation |
| TC07 / E2E07 — logout and protected access | P1 | Low | Login → logout → request inventory | Session not terminated or protected content exposed |
| TC08 — catalog, detail and reset | P1 | Medium | Verify product card and all sorting criteria → inspect/add/remove product → reset | Catalog information, selection and reset regressions |
| TC09 — empty cart and continue shopping | P1 | Low | Open empty cart → continue shopping | Empty-state and return-navigation defects |
| TC10 — cancel from order overview | P2 | Low | Submit checkout details → cancel overview → catalog | Incorrect cancel destination or accidental order completion |

P0 tests should be run on every change when the demo site is available. P1 tests cover important session and cart behavior; TC08 is lower-risk supporting coverage. Effort is a planning estimate, not a measured runtime.

## 5. Test Scenarios

The executable scenarios are organized by concern in `src/tests/`:

- **TC01 / E2E01:** Successful purchase of one product; verifies product identity, item subtotal, arithmetic consistency and completion.
- **TC02 / E2E02:** Successful purchase of multiple products; verifies aggregation, subtotal, arithmetic consistency and completion.
- **TC03 / E2E03:** Locked-user authentication fails and leaves the user unauthenticated.
- **TC04 / E2E04:** Empty and partially completed checkout forms report the missing required fields, then accept valid information.
- **TC05 / E2E05:** Add three products, remove one, and confirm only the remaining two appear in the order.
- **TC06 / E2E06:** Cancel checkout and confirm the cart selection is preserved.
- **TC07 / E2E07:** Logout and verify protected inventory redirects to login.
- **TC08:** Verify product-card information, all four sorting criteria, detail price, add/remove and reset behavior.
- **TC09:** Verify the zero-item cart state and Continue Shopping navigation.
- **TC10:** Verify cancellation from the order overview returns to product discovery.

### Scenario-to-TypeScript correspondence

| Scenario | Executable case |
|---|---|
| TC01 / E2E01 | `src/tests/checkout.spec.ts` — `complete a successful purchase of one product` |
| TC02 / E2E02 | `src/tests/checkout.spec.ts` — `aggregate multiple products and calculate order total` |
| TC03 / E2E03 | `src/tests/login.spec.ts` — `locked account is rejected and remains unauthenticated` |
| TC04 / E2E04 | `src/tests/checkout.spec.ts` — `required checkout fields reject omissions and allow recovery` |
| TC05 / E2E05 | `src/tests/cart.spec.ts` — `removing an item synchronizes cart and order contents` |
| TC06 / E2E06 | `src/tests/checkout.spec.ts` — `cancel checkout without losing the cart selection` |
| TC07 / E2E07 | `src/tests/login.spec.ts` — `logout prevents access to protected inventory` |
| TC08 | `src/tests/cart.spec.ts` — `sorting, product inspection, and application-state reset` |
| TC09 | `src/tests/cart.spec.ts` — `empty cart and continue-shopping boundary` |
| TC10 | `src/tests/checkout.spec.ts` — `cancel from order overview returns to product discovery` |

## 6. DSL Description

### DSL concepts

- **Action:** A meaningful customer intention, such as `addProductToCart` or `submitCheckoutInformation`. It is not a raw click or selector.
- **Perception:** An observable application result, such as `cartContains` or `orderConfirmationIsDisplayed`. It is not a hidden implementation detail.
- **Scenario step:** One action paired with one or more expected perceptions.
- **Interpreter:** Executes each action and checks its expected perception using Playwright.

Actions and perceptions use TypeScript discriminated unions. This keeps the vocabulary explicit and lets TypeScript detect unsupported operation types during development.

### Task and concept correspondence

The DSL vocabulary models customer tasks and domain concepts, not SauceDemo selectors. This is the intended abstraction level for the assignment.

| Application task | Customer/domain concept | DSL mapping | Automated coverage |
|---|---|---|---|
| T02.1–T02.3: view, inspect, sort catalog | Product discovery and product information | `browseProducts`, `sortProductsBy` → `productCatalogIsDisplayed`, `productIsDisplayed`, `productsAreSortedBy`, `productPriceIs` | TC08 |
| T02.4–T02.6: select/remove/open product | Product selection and product detail | `addProductToCart`, `removeProductFromCart`, `viewProductDetails` → `productIsInCart`, `productIsNotInCart`, `productDetailsAreDisplayed` | TC01, TC05, TC08 |
| T03.1–T03.4: inspect, select, deselect, return | Product inspection and selection | Same shared product actions and perceptions; no duplicated detail-only add/remove action | TC08 |
| T04.1–T04.5: review/change cart and checkout | Cart as the selected-item collection | `reviewCart`, `removeProductFromCart`, `continueShopping`, `startCheckout` → cart contents/count/empty and checkout-page perceptions | TC05, TC06, TC09 |
| T05.1–T05.5: enter, validate, submit, cancel | Customer information and form validation | `provideCheckoutInformation`, `submitCheckoutInformation`, `cancelCheckout` → accepted/rejected and required-field perceptions | TC04, TC06 |
| T06.1–T06.6: verify order and finish/cancel | Order, payment/shipping summary and price calculation | `reviewOrder`, `completePurchase`, `cancelCheckout` → products, subtotal, payment/shipping visibility, arithmetic and consistency perceptions | TC01, TC02, TC10 |
| T07.1–T07.3: complete and confirm | Purchase lifecycle | `completePurchase`, `returnToShopping` → completion and success-message perceptions | TC01, TC02 |
| T08.1–T08.6: menu, logout, reset, protected access | Navigation and session state | `openNavigationMenu`, `logout`, `resetShoppingState`, `browseProducts` → menu, terminated-session, reset and protected-content perceptions | TC07, TC08 |

T08 About navigation and the All Items menu link are represented only partially: the catalog can be opened through `browseProducts`, and `openAboutInformation` exists, but an external-page perception/test is not included because it depends on an external site. Add that scenario if the instructor expects every navigation task to be exercised.

### Actions

| ID | Action | Intent |
|---|---|---|
| A01 | `openApplication` | Start at the application entry point |
| A02 | `authenticateAs` | Sign in as a supplied user |
| A03 | `logout` | End the authenticated session |
| A04 | `browseProducts` | Navigate to the product catalog |
| A05 | `sortProductsBy` | Organize catalog products by a criterion |
| A06 | `viewProductDetails` | Inspect a selected product |
| A07 | `addProductToCart` | Select a product for purchase |
| A08 | `removeProductFromCart` | Cancel a product selection |
| A09 | `reviewCart` | Open the shopping cart |
| A10 | `continueShopping` | Return from cart to the catalog |
| A11 | `startCheckout` | Begin checkout from the cart |
| A12 | `provideCheckoutInformation` | Enter customer information |
| A13 | `submitCheckoutInformation` | Submit checkout information |
| A14 | `cancelCheckout` | Leave checkout and return to cart/catalog |
| A15 | `reviewOrder` | Inspect the order overview |
| A16 | `completePurchase` | Confirm the purchase |
| A17 | `returnToShopping` | Return to product discovery |
| A18 | `resetShoppingState` | Clear the current shopping selection |
| A19 | `openAboutInformation` | Open Sauce Labs information |
| A20 | `openNavigationMenu` | Open customer navigation options |

### Perceptions

| ID | Perception | Observable evidence |
|---|---|---|
| P01 | `loginPageIsDisplayed` | Login form is visible |
| P02 | `customerIsAuthenticated` | Authenticated catalog is visible |
| P03 | `authenticationFailed` | Authentication error is visible |
| P04 | `accountIsLocked` | Locked-account message is visible |
| P05 | `sessionIsTerminated` | Login page is restored |
| P06 | `productCatalogIsDisplayed` | Catalog heading and list are visible |
| P07 | `productIsDisplayed` | Product card name, description, price and image are visible |
| P08 | `productsAreSortedBy` | Displayed product order matches criterion |
| P09 | `productDetailsAreDisplayed` | Requested product detail is visible |
| P10 | `productPriceIs` | Product displays expected price |
| P11 | `productIsInCart` | Product selection control/row and cart badge show selected state |
| P12 | `productIsNotInCart` | Product is absent or add control is restored |
| P13 | `cartIsDisplayed` | Cart page is visible |
| P14 | `cartContains` | Cart shows exactly the expected products |
| P15 | `cartDoesNotContain` | Requested product row is absent |
| P16 | `cartIsEmpty` | No rows or cart badge remain |
| P17 | `cartItemCountIs` | Cart rows and badge match expected count |
| P18 | `checkoutIsAvailable` | Checkout control is enabled |
| P19 | `checkoutInformationPageIsDisplayed` | Checkout information page is visible |
| P20 | `checkoutInformationIsAccepted` | Progression to overview is visible |
| P21 | `checkoutInformationIsRejected` | Validation error is visible |
| P22 | `requiredFieldErrorIsDisplayed` | Error identifies the requested missing field(s) |
| P23 | `orderOverviewIsDisplayed` | Order overview page is visible |
| P24 | `orderContains` | Overview shows exactly the expected products |
| P25 | `orderItemTotalIs` | Item subtotal matches expected amount |
| P26 | `orderTaxIs` | Tax amount is visible and optionally matches expectation |
| P27 | `orderTotalIs` | Total matches expected amount |
| P28 | `orderCalculationIsCorrect` | Total equals subtotal plus tax |
| P29 | `orderInformationIsConsistent` | Overview matches scenario selection |
| P30 | `orderConfirmationIsDisplayed` | Completion page is visible |
| P31 | `purchaseIsCompleted` | Completion page and confirmation evidence are visible |
| P32 | `orderSuccessMessageIsDisplayed` | “Thank you for your order!” is visible |
| P33 | `navigationMenuIsDisplayed` | Navigation options are visible |
| P34 | `shoppingStateIsReset` | Badge and product selections return to initial state |
| P35 | `protectedContentIsUnavailable` | Login is restored and inventory is unavailable |
| P36 | `orderPaymentAndShippingInformationIsDisplayed` | Payment and shipping summaries are visible |

Perceptions assert visible UI state rather than relying solely on the interpreter's internal model. Optional parameters (such as an error reason or expected amount) narrow the assertion when a scenario needs a precise value.

### DSL interface

A scenario is a list of typed `ScenarioStep` values. Factory functions in `src/dsl/actions.ts` and `src/dsl/perceptions.ts` make scenario intent concise. One action may be checked against multiple perceptions:

```ts
{
  action: actions.submitCheckoutInformation(),
  expected: [
    perceptions.orderOverviewIsDisplayed(),
    perceptions.orderContains('Sauce Labs Backpack'),
    perceptions.orderCalculationIsCorrect(),
  ],
}
```

`runScenario(page, steps)` executes the scenario and creates a named Playwright test step for each DSL step.

## 7. DSL Implementation Strategy

### Architecture

```text
src/
├── dsl/          # Actions, perceptions, shared types and public exports
├── interpreter/  # Action execution, perception evaluation, scenario runner
├── pages/        # Login, inventory, cart and checkout page objects
└── tests/        # Login, cart and checkout scenarios
```

- **Page objects** encapsulate SauceDemo page locators and user-level UI operations.
- **ActionExecutor** maps DSL actions to page-object operations and tracks selected products for consistency checks.
- **PerceptionEvaluator** checks the actual UI and order amounts; the tracked selection is used only as an additional expected-state comparison.
- **Scenario runner** executes action/perception pairs, keeping test cases independent of selector details.
- **Playwright Test** provides browser lifecycle, parallel execution, retries in CI, traces, screenshots and HTML reporting.

### Interpreter

Each `Action` is handled exhaustively by `ActionExecutor.execute()`. Each `Perception` is handled by `PerceptionEvaluator.evaluate()`. A newly added union variant creates a TypeScript compile-time obligation to implement its behavior, helping prevent silent omissions.

The execution sequence is:

1. A spec creates a `ScenarioStep[]` using the DSL factories; it names a customer action and expected perception(s), not a locator.
2. `runScenario(page, steps)` receives the Playwright `Page` created by Playwright Test and creates one `ActionExecutor` and one `PerceptionEvaluator` for that scenario.
3. For each step, the executor's `switch` maps the action type to a page-object method. Page objects use Playwright locators to operate the **real website** at SauceDemo.
4. After the action completes, the evaluator uses Playwright `expect` assertions to inspect the rendered UI. A step passes only when every expected perception is observed.
5. Playwright reports each DSL step separately, and saves traces/screenshots on failure.

There is no SauceDemo website implementation or local mock in this repository. The `src/pages/` directory contains Page Object helper classes (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`), not HTML pages to build or deploy. Keep these helpers: they isolate locators from the higher-level DSL. They can be merged into the interpreter for a tiny demo, but that would make the interpreter harder to maintain and would not make the tests more directly connected to the website.

### Playwright integration

The page objects use stable SauceDemo `data-test` attributes where available and user-facing roles/names for controls. The base URL is configurable via `BASE_URL`; browser and test defaults are in `playwright.config.ts`. The suite is intentionally UI-driven and does not call internal APIs or manipulate application storage directly.

## 8. AI Usage

### Prompts used

The following are concise records of the prompts used in the design and strategy phases. The original prompts also included the full DSL and scenario tables pasted into the conversation:

1. **DSL review prompt:**

  > Act as a DSL Architect specialized in Model-Based Testing and UI Test Automation. Evaluate my existing SauceDemo Actions and Perceptions: their abstraction level, missing operations, duplicated or overly technical operations, names, whether each Action is a meaningful user task, and whether each Perception is an observable system state. Explain why for every proposed improvement, preserve the existing design where possible, and do not implement Playwright yet.

2. **Test-strategy prompt:**

  > Act as a Software Test Strategy Expert. Propose a SauceDemo test case generation strategy combining functional coverage, equivalence partitioning, boundary-value analysis, state-transition testing, and end-to-end scenarios. For each technique, explain why it is relevant, give concrete examples and test scenarios, and identify covered risks. Prioritize scenarios by importance and implementation effort. Do not write automation code.

3. **Implementation request (summary):**

  > Implement the approved SauceDemo DSL in TypeScript with Playwright. Keep test cases expressed as user-level Actions and observable Perceptions, route those through an interpreter, and use page objects only to isolate locators for the live SauceDemo website. Include tests corresponding to the prioritized scenarios and document setup, architecture, prompts, validation and limitations in README.md.

The supplied action/perception vocabulary and E2E01–E2E07 journeys were used as the design input. Implementation was then requested separately as a TypeScript Playwright DSL project.

### AI-assisted implementation

AI assistance was used to scaffold the TypeScript project, model the DSL types and factories, create the interpreter and page objects, implement the listed scenarios, and draft this documentation. The DSL preserves the supplied business vocabulary and adds coverage for sorting/detail/reset, empty-cart navigation, overview cancellation, and payment/shipping summaries.

### Agent implementation workflow

The coding agent was used as an implementation assistant in VS Code, not as the authority on expected behavior. The workflow was: (1) inspect the supplied tasks/actions/perceptions; (2) implement typed action and perception unions; (3) connect each action to Playwright-backed page objects in the interpreter; (4) connect perceptions to visible assertions; (5) express scenarios only with DSL factories; and (6) run TypeScript checks and the end-to-end suite. The team must review the changes, compare them with the task model, and validate any AI-generated assumptions before submission. No separate autonomous sub-agent was used for this implementation.


## 9. Installation and Execution

Requirements: Node.js 20+ and npm.

1. Install project dependencies: `npm install`.
2. Install Playwright's Chromium browser: `npx playwright install chromium`.
3. Optionally copy `.env.example` to `.env` and adjust values. The Playwright configuration loads `.env` automatically.
4. Run all tests: `npm test`.
5. Run tests visibly: `npm run test:headed`.
6. Open the last HTML report: `npm run report`.
7. Check TypeScript types: `npm run typecheck`.

Supported environment variables are `BASE_URL`, `STANDARD_USER`, `STANDARD_PASSWORD`, and `LOCKED_USER`. `.env` is ignored by Git; do not commit credentials. The public demo credentials are defaults for convenience, not secrets.

## 10. Limitations

- This is a UI test suite for a public demo application, not a production payment system; data, availability and behavior may change.
- The current examples cover the supplied shopping/authentication scope, including all four catalog sorting criteria, but do not test every inventory item, external About navigation, every SauceDemo user type, or all network/browser failure modes.
- Checkout validation focuses on required fields. The demo does not specify meaningful postal-code formats, name-length rules or an upper cart-size boundary for this project.
- Financial assertions verify selected known subtotals and the invariant `total = subtotal + tax`; they do not independently certify the application's tax policy.
- The `selectedProducts` set is a lightweight scenario model, not a persistent domain model. The visible page remains the source of truth for perceptions.
- UI tests can be slower and more sensitive to external availability than unit tests. Locators and expected messages should be reviewed if SauceDemo changes.
