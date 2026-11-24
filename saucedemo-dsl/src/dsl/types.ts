export type SortCriterion = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export interface CheckoutInformation {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export type Action =
  | { type: 'openApplication' }
  | { type: 'authenticateAs'; username: string; password: string }
  | { type: 'openNavigationMenu' }
  | { type: 'logout' }
  | { type: 'browseProducts' }
  | { type: 'sortProductsBy'; criterion: SortCriterion }
  | { type: 'viewProductDetails'; product: string }
  | { type: 'addProductToCart'; product: string }
  | { type: 'removeProductFromCart'; product: string }
  | { type: 'reviewCart' }
  | { type: 'continueShopping' }
  | { type: 'startCheckout' }
  | { type: 'provideCheckoutInformation'; information: CheckoutInformation }
  | { type: 'submitCheckoutInformation' }
  | { type: 'cancelCheckout' }
  | { type: 'reviewOrder' }
  | { type: 'completePurchase' }
  | { type: 'returnToShopping' }
  | { type: 'resetShoppingState' }
  | { type: 'openAboutInformation' };

export type Perception =
  | { type: 'loginPageIsDisplayed' }
  | { type: 'customerIsAuthenticated' }
  | { type: 'authenticationFailed'; reason?: string }
  | { type: 'accountIsLocked' }
  | { type: 'sessionIsTerminated' }
  | { type: 'productCatalogIsDisplayed' }
  | { type: 'productIsDisplayed'; product: string }
  | { type: 'productsAreSortedBy'; criterion: SortCriterion }
  | { type: 'productDetailsAreDisplayed'; product: string }
  | { type: 'productPriceIs'; product: string; price: string }
  | { type: 'productIsInCart'; product: string }
  | { type: 'productIsNotInCart'; product: string }
  | { type: 'cartIsDisplayed' }
  | { type: 'cartContains'; products: string[] }
  | { type: 'cartDoesNotContain'; product: string }
  | { type: 'cartIsEmpty' }
  | { type: 'cartItemCountIs'; count: number }
  | { type: 'checkoutIsAvailable' }
  | { type: 'checkoutInformationPageIsDisplayed' }
  | { type: 'checkoutInformationIsAccepted' }
  | { type: 'checkoutInformationIsRejected'; reason?: string }
  | { type: 'requiredFieldErrorIsDisplayed'; fields: string[] }
  | { type: 'orderOverviewIsDisplayed' }
  | { type: 'orderContains'; products: string[] }
  | { type: 'orderItemTotalIs'; amount?: number }
  | { type: 'orderTaxIs'; amount?: number }
  | { type: 'orderTotalIs'; amount?: number }
  | { type: 'orderCalculationIsCorrect' }
  | { type: 'orderInformationIsConsistent' }
  | { type: 'orderPaymentAndShippingInformationIsDisplayed' }
  | { type: 'orderConfirmationIsDisplayed' }
  | { type: 'purchaseIsCompleted' }
  | { type: 'orderSuccessMessageIsDisplayed' }
  | { type: 'navigationMenuIsDisplayed' }
  | { type: 'shoppingStateIsReset' }
  | { type: 'protectedContentIsUnavailable' };

export interface ScenarioStep {
  action: Action;
  expected: Perception | Perception[];
}
