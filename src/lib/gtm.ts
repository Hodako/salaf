type GTMEvent = {
    event: string;
    ecommerce?: {
        items?: any[];
        [key: string]: any;
    };
    [key: string]: any;
};

/**
 * Pushes an event or data object to the GTM dataLayer.
 * 
 * Automatically initializes the dataLayer if it doesn't exist and 
 * clears previous ecommerce objects to ensure clean GA4 event tracking.
 * 
 * @param data - The event data to push to the dataLayer.
 */
export const pushToDataLayer = (data: GTMEvent) => {
    if (typeof window !== "undefined") {
        (window as any).dataLayer = (window as any).dataLayer || [];

        if (data.ecommerce) {
            (window as any).dataLayer.push({ ecommerce: null });
        }
        (window as any).dataLayer.push(data);
    }
};

/**
 * Logs a `view_item_list` event to GTM.
 * 
 * Used when a user views a list of products (e.g., on a category or shop page).
 * 
 * @param products - The list of products being viewed.
 * @param listName - The name of the list (defaults to "Shop Page").
 */
export const logViewItemList = (products: any[], listName: string = "Shop Page") => {
    pushToDataLayer({
        event: "view_item_list",
        ecommerce: {
            item_list_id: listName.toLowerCase().replace(/\s+/g, "_"),
            item_list_name: listName,
            items: products.map((p, index) => ({
                item_id: String(p._id || p.slug),
                item_name: p.name,
                index: index + 1,
                item_brand: "Salaf",
                price: Number(p.basePrice || (p.variations?.[0]?.salePrice || p.variations?.[0]?.basePrice) || 0),
                quantity: 1
            }))
        }
    });
};

/**
 * Logs a `view_item` event when a user views a product detail page.
 * 
 * Includes Meta Pixel compatibility fields.
 * 
 * @param product - The product object being viewed.
 */
export const logViewItem = (product: any) => {
    const price = Number(product.basePrice || (product.variations?.[0]?.salePrice || product.variations?.[0]?.basePrice) || 0);
    const productId = String(product._id || product.slug);

    pushToDataLayer({
        event: "view_item",
        ecommerce: {
            currency: "BDT",
            value: price,
            items: [{
                item_id: productId,
                item_name: product.name,
                item_brand: "Salaf",
                price: price,
                quantity: 1
            }]
        },
        content_ids: [productId],
        content_name: product.name,
        content_type: "product",
        value: price,
        currency: "BDT"
    });
};

/**
 * Logs an `add_to_wishlist` event when a product is saved to the wishlist.
 * 
 * Includes Meta Pixel compatibility fields.
 * 
 * @param product - The product object added to the wishlist.
 */
export const logAddToWishlist = (product: any) => {
    const price = Number(product.basePrice || (product.variations?.[0]?.salePrice || product.variations?.[0]?.basePrice) || 0);
    const productId = String(product._id || product.slug);

    pushToDataLayer({
        event: "add_to_wishlist",
        ecommerce: {
            currency: "BDT",
            value: price,
            items: [{
                item_id: productId,
                item_name: product.name,
                item_brand: "Salaf",
                price: price,
                quantity: 1
            }]
        },
        content_ids: [productId],
        content_name: product.name,
        content_type: "product",
        value: price,
        currency: "BDT"
    });
};

/**
 * Logs an `add_to_cart` event when a user adds a product (or specific variation) to their cart.
 * 
 * @param product - The parent product object.
 * @param variation - The specific variation selected.
 * @param quantity - Number of items added (defaults to 1).
 */
export const logAddToCart = (product: any, variation: any, quantity: number = 1) => {
    const price = Number(variation?.salePrice || variation?.basePrice || product.basePrice || 0);
    const productId = String(product._id || product.slug);

    pushToDataLayer({
        event: "add_to_cart",
        ecommerce: {
            currency: "BDT",
            value: price * quantity,
            items: [{
                item_id: productId,
                item_name: product.name,
                item_brand: "Salaf",
                item_variant: `${variation?.volume}${variation?.volumeUnit || ""}${variation?.variantType ? ` (${variation.variantType})` : ""}`,
                price: price,
                quantity: quantity
            }]
        },
        content_ids: [productId],
        content_name: product.name,
        content_type: "product",
        value: price * quantity,
        currency: "BDT",
        contents: [{
            id: productId,
            quantity: quantity,
            item_price: price
        }]
    });
};

/**
 * Logs a `select_item` event when a user clicks on a product from a list.
 * 
 * @param product - The product object selected.
 * @param listName - The name of the list from which the product was selected.
 */
export const logSelectItem = (product: any, listName: string) => {
    pushToDataLayer({
        event: "select_item",
        ecommerce: {
            item_list_id: listName.toLowerCase().replace(/\s+/g, "_"),
            item_list_name: listName,
            items: [{
                item_id: String(product._id || product.slug),
                item_name: product.name,
                item_brand: "Salaf",
                price: Number(product.basePrice || (product.variations?.[0]?.salePrice || product.variations?.[0]?.basePrice) || 0),
                quantity: 1
            }]
        }
    });
};

/**
 * Logs a search event with the query term.
 * 
 * @param query - The search string entered by the user.
 */
export const logSearch = (query: string) => {
    pushToDataLayer({
        event: "search",
        search_term: query
    });
};

/**
 * Logs a login event.
 * 
 * @param method - The authentication method used (defaults to "Google").
 */
export const logLogin = (method: string = "Google") => {
    pushToDataLayer({
        event: "login",
        method: method
    });
};

/**
 * Logs a sign-up event.
 * 
 * @param method - The authentication method used (defaults to "Google").
 */
export const logSignUp = (method: string = "Google") => {
    pushToDataLayer({
        event: "sign_up",
        method: method
    });
};

/**
 * Logs the start of the checkout process.
 * 
 * @param cart - The current list of cart items.
 * @param totalPrice - Total value of the cart.
 */
export const logBeginCheckout = (cart: any[], totalPrice: number) => {
    pushToDataLayer({
        event: "begin_checkout",
        ecommerce: {
            currency: "BDT",
            value: Number(totalPrice),
            items: cart.map(item => ({
                item_id: String(item.productId),
                item_name: item.productName,
                item_brand: "Salaf",
                item_variant: item.volume + (item.variantType ? ` (${item.variantType})` : ""),
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        },
        content_ids: cart.map(item => String(item.productId)),
        content_type: "product",
        value: Number(totalPrice),
        currency: "BDT",
        contents: cart.map(item => ({
            id: String(item.productId),
            quantity: Number(item.quantity),
            item_price: Number(item.price)
        }))
    });
};

/**
 * Logs when a user provides shipping information during checkout.
 * 
 * @param cart - The current list of cart items.
 * @param totalPrice - Total value including shipping.
 * @param shippingTier - The selected shipping method/tier.
 */
export const logAddShippingInfo = (cart: any[], totalPrice: number, shippingTier: string) => {
    pushToDataLayer({
        event: "add_shipping_info",
        ecommerce: {
            currency: "BDT",
            value: Number(totalPrice),
            shipping_tier: shippingTier,
            items: cart.map(item => ({
                item_id: String(item.productId),
                item_name: item.productName,
                item_brand: "Salaf",
                item_variant: item.volume + (item.variantType ? ` (${item.variantType})` : ""),
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        }
    });
};

/**
 * Logs when a user provides payment information during checkout.
 * 
 * @param cart - The current list of cart items.
 * @param totalPrice - Total transaction value.
 * @param paymentType - The selected payment method (defaults to "Cash on Delivery").
 */
export const logAddPaymentInfo = (cart: any[], totalPrice: number, paymentType: string = "Cash on Delivery") => {
    pushToDataLayer({
        event: "add_payment_info",
        ecommerce: {
            currency: "BDT",
            value: Number(totalPrice),
            payment_type: paymentType,
            items: cart.map(item => ({
                item_id: String(item.productId),
                item_name: item.productName,
                item_brand: "Salaf",
                item_variant: item.volume + (item.variantType ? ` (${item.variantType})` : ""),
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        }
    });
};

/**
 * Logs a cart view event.
 * 
 * @param cart - The current list of items in the cart.
 * @param totalPrice - Total value of items in the cart.
 */
export const logViewCart = (cart: any[], totalPrice: number) => {
    pushToDataLayer({
        event: "view_cart",
        ecommerce: {
            currency: "BDT",
            value: Number(totalPrice),
            items: cart.map(item => ({
                item_id: String(item.productId),
                item_name: item.productName,
                item_brand: "Salaf",
                item_variant: item.volume + (item.variantType ? ` (${item.variantType})` : ""),
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        }
    });
};

/**
 * Logs a successful purchase event.
 * 
 * @param order - The completed order object containing transaction details and items.
 */
export const logPurchase = (order: any) => {
    pushToDataLayer({
        event: "purchase",
        ecommerce: {
            transaction_id: String(order._id),
            currency: "BDT",
            value: Number(order.totalAmount),
            shipping: Number(order.shippingFee || 0),
            tax: 0,
            items: order.items.map((item: any) => ({
                item_id: String(item.product),
                item_name: item.productName,
                item_brand: "Salaf",
                item_variant: item.volume + (item.variantType ? ` (${item.variantType})` : ""),
                price: Number(item.price),
                quantity: Number(item.quantity)
            }))
        }
    });
};

