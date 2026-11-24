import type { Action, CheckoutInformation, SortCriterion } from './types';

export const actions = {
  openApplication: (): Action => ({ type: 'openApplication' }),
  authenticateAs: (username: string, password: string): Action => ({ type: 'authenticateAs', username, password }),
  openNavigationMenu: (): Action => ({ type: 'openNavigationMenu' }),
  logout: (): Action => ({ type: 'logout' }),
  browseProducts: (): Action => ({ type: 'browseProducts' }),
  sortProductsBy: (criterion: SortCriterion): Action => ({ type: 'sortProductsBy', criterion }),
  viewProductDetails: (product: string): Action => ({ type: 'viewProductDetails', product }),
  addProductToCart: (product: string): Action => ({ type: 'addProductToCart', product }),
  removeProductFromCart: (product: string): Action => ({ type: 'removeProductFromCart', product }),
  reviewCart: (): Action => ({ type: 'reviewCart' }),
  continueShopping: (): Action => ({ type: 'continueShopping' }),
  startCheckout: (): Action => ({ type: 'startCheckout' }),
  provideCheckoutInformation: (information: CheckoutInformation): Action => ({ type: 'provideCheckoutInformation', information }),
  submitCheckoutInformation: (): Action => ({ type: 'submitCheckoutInformation' }),
  cancelCheckout: (): Action => ({ type: 'cancelCheckout' }),
  reviewOrder: (): Action => ({ type: 'reviewOrder' }),
  completePurchase: (): Action => ({ type: 'completePurchase' }),
  returnToShopping: (): Action => ({ type: 'returnToShopping' }),
  resetShoppingState: (): Action => ({ type: 'resetShoppingState' }),
  openAboutInformation: (): Action => ({ type: 'openAboutInformation' }),
};
