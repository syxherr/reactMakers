import React, { useReducer, useCallback, useRef, useEffect } from "react";
import styles from "./Luxora.module.css";
import { Helmet } from "react-helmet-async";

const PRODUCTS = [
  {
    id: 1,
    name: "MacBook Air M2",
    price: 18999000,
    sold: 312,
    category: "Electronics",
    color: "#C0C0C0",
    thumbnail: "💻",
  },
  {
    id: 2,
    name: "iPhone 15 Pro",
    price: 15999000,
    sold: 542,
    category: "Electronics",
    color: "#2F2F2F",
    thumbnail: "📱",
  },
  {
    id: 3,
    name: "Mechanical Keyboard RGB",
    price: 1250000,
    sold: 689,
    category: "Accessories",
    color: "#1E1E1E",
    thumbnail: "⌨️",
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    price: 4999000,
    sold: 221,
    category: "Electronics",
    color: "#EAEAEA",
    thumbnail: "🎧",
  },
  {
    id: 5,
    name: "4K Monitor 27 inch",
    price: 4799000,
    sold: 174,
    category: "Electronics",
    color: "#4A4A4A",
    thumbnail: "🖥️",
  },
  {
    id: 6,
    name: "USB-C Hub 8 in 1",
    price: 399000,
    sold: 977,
    category: "Accessories",
    color: "#9E9E9E",
    thumbnail: "🔌",
  },
  {
    id: 7,
    name: "Gaming Mouse Wireless",
    price: 650000,
    sold: 811,
    category: "Accessories",
    color: "#101010",
    thumbnail: "🖱️",
  },
  {
    id: 8,
    name: "LED Ring Light 18 inch",
    price: 349000,
    sold: 623,
    category: "Electronics",
    color: "#FFF3C4",
    thumbnail: "💡",
  },
];

type Product = (typeof PRODUCTS)[0];
type CartItem = Product & { qty: number };

type State = {
  cart: CartItem[];
  filter: string;
  search: string;
  isCartOpen: boolean;
  notification: { message: string } | null;
};

type Action =
  | { type: "ADD_TO_CART"; product: Product }
  | { type: "REMOVE_FROM_CART"; id: number }
  | { type: "CHANGE_QUANTITY"; id: number; delta: number }
  | { type: "FILTER_CATEGORY"; value: string }
  | { type: "SET_SEARCH"; value: string }
  | { type: "TOGGLE_CART" }
  | { type: "CLEAR_NOTIFICATION" };

const CATEGORIES = ["All", "Electronics", "Accessories"];
const fmt = (n: number): string => "Rp " + n.toLocaleString("id-ID");

const CART_KEY = "luxora_cart";

function loadCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

const initialState: State = {
  cart: loadCart(),
  filter: "All",
  search: "",
  isCartOpen: false,
  notification: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TO_CART": {
      const inCart = state.cart.find((item) => item.id === action.product.id);
      const newCart = inCart
        ? state.cart.map((item) =>
            item.id === action.product.id ? { ...item, qty: item.qty + 1 } : item
          )
        : [...state.cart, { ...action.product, qty: 1 }];
      saveCart(newCart);
      return {
        ...state,
        cart: newCart,
        notification: { message: `${action.product.name} added to cart!` },
      };
    }

    case "REMOVE_FROM_CART": {
      const removedItem = state.cart.find((item) => item.id === action.id);
      const newCart = state.cart.filter((item) => item.id !== action.id);
      saveCart(newCart);
      return {
        ...state,
        cart: newCart,
        notification: {
          message: removedItem
            ? `${removedItem.name} removed from cart!`
            : "Item removed!",
        },
      };
    }

    case "CHANGE_QUANTITY": {
      const targetItem = state.cart.find((item) => item.id === action.id);
      if (!targetItem) return state;
      const newQty = targetItem.qty + action.delta;

      if (newQty <= 0) {
        const newCart = state.cart.filter((item) => item.id !== action.id);
        saveCart(newCart);
        return { ...state, cart: newCart };
      }
      const newCart = state.cart.map((item) =>
        item.id === action.id ? { ...item, qty: newQty } : item
      );
      saveCart(newCart);
      return { ...state, cart: newCart };
    }

    case "FILTER_CATEGORY":
      return { ...state, filter: action.value };
    case "SET_SEARCH":
      return { ...state, search: action.value };
    case "TOGGLE_CART":
      return { ...state, isCartOpen: !state.isCartOpen };
    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null };

    default:
      return state;
  }
}


interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article
      className={styles.card}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />
      <meta itemProp="category" content={product.category} />

      <div
        className={styles.cardImg}
        style={{ background: product.color }}
        aria-hidden="true"
      >
        {product.thumbnail}
      </div>

      <div className={styles.cardBody}>
        <p className={styles.cardName} itemProp="name">
          {product.name}
        </p>

        <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
          <meta itemProp="priceCurrency" content="IDR" />
          <data
            className={styles.cardPrice}
            itemProp="price"
            value={product.price}
          >
            {fmt(product.price)}
          </data>
        </div>

        <p className={styles.cardSold}>
          <span aria-hidden="true">🛒</span>{" "}
          <span itemProp="aggregateRating">{product.sold} sold</span>
        </p>

        <button
          className={styles.addBtn}
          onClick={() => onAdd(product)}
          aria-label={`Add ${product.name} to cart`}
        >
          + Add to Cart
        </button>
      </div>
    </article>
  );
}

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

function CartDrawer({ cart, onClose, onChangeQty, onRemove }: CartDrawerProps) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const headingId = "cart-drawer-title";
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus to close button when drawer opens
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <>
    
      <div
        className={styles.overlay}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className={styles.drawer}
      >
        <div className={styles.drawerHead}>
          <h2 id={headingId}>
            Shopping Cart <span aria-hidden="true">🛒</span>
          </h2>
          <button
            ref={closeRef}
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          {cart.length === 0 ? (
            <p className={styles.emptyMsg}>Your cart is empty.</p>
          ) : (
            <ul aria-label="Cart items" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {cart.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  <div className={styles.cartEmoji} aria-hidden="true">
                    {item.thumbnail}
                  </div>
                  <div className={styles.cartInfo}>
                    <p className={styles.cartName}>{item.name}</p>
                    <p className={styles.cartPrice}>{fmt(item.price)}</p>
                    <div className={styles.qtyRow} role="group" aria-label={`Quantity for ${item.name}`}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onChangeQty(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className={styles.qtyNum} aria-live="polite" aria-atomic="true">
                        {item.qty}
                      </span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => onChangeQty(item.id, +1)}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.drawerFoot}>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span className={styles.totalAmount}>
                <data value={total}>{fmt(total)}</data>
              </span>
            </div>
            <button className={styles.checkoutBtn} aria-label="Proceed to checkout">
              Checkout →
            </button>
          </div>
        )}
      </div>
    </>
  );
}


function Luxora() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { search, notification, filter, cart, isCartOpen } = state;

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const filtered = PRODUCTS.filter(
    (p) =>
      (filter === "All" || p.category === filter) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = useCallback(
    (product: Product) => dispatch({ type: "ADD_TO_CART", product }),
    []
  );
  const handleRemove = useCallback(
    (id: number) => dispatch({ type: "REMOVE_FROM_CART", id }),
    []
  );
  const handleChangeQty = useCallback(
    (id: number, delta: number) => dispatch({ type: "CHANGE_QUANTITY", id, delta }),
    []
  );
  const handleToggleCart = useCallback(
    () => dispatch({ type: "TOGGLE_CART" }),
    []
  );
  const handleSearch = useCallback(
    (value: string) => dispatch({ type: "SET_SEARCH", value }),
    []
  );
  const handleFilter = useCallback(
    (value: string) => dispatch({ type: "FILTER_CATEGORY", value }),
    []
  );

  if (notification) {
    setTimeout(() => dispatch({ type: "CLEAR_NOTIFICATION" }), 3000);
  }

  const cartLabel = totalItems > 0
    ? `Open cart, ${totalItems} item${totalItems > 1 ? "s" : ""}`
    : "Open cart, empty";

  return (
    <>
      <Helmet>
        <title>Luxora Shop — Electronics & Accessories</title>
        <meta
          name="description"
          content="Shop the latest electronics and accessories at Luxora — MacBooks, iPhones, keyboards, headphones, monitors and more."
        />
        <meta property="og:title" content="Luxora Shop — Electronics & Accessories" />
        <meta
          property="og:description"
          content="Shop the latest electronics and accessories at Luxora."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://luxora.shop" />
      </Helmet>

      <div className={styles.page}>
        
        <nav className={styles.navbar} aria-label="Main navigation">
          <a href="/" className={styles.logo} aria-label="Luxora Shop home">
            ✦ Luxora Shop
          </a>
          <button
            className={styles.cartBtn}
            onClick={handleToggleCart}
            aria-expanded={isCartOpen}
            aria-controls="cart-drawer"
            aria-label={cartLabel}
          >
            Cart <span aria-hidden="true">🛒</span>
            {totalItems > 0 && (
              <span className={styles.badge} aria-hidden="true">
                {totalItems}
              </span>
            )}
          </button>
        </nav>

        <main id="main-content">


          {/* Search & filters */}
          <section aria-label="Search and filter products" className={styles.filters}>
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              className={styles.searchInput}
              placeholder="Search products…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              type="search"
              autoComplete="off"
            />

            <div role="group" aria-label="Filter by category">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${filter === cat ? styles.active : ""}`}
                  onClick={() => handleFilter(cat)}
                  aria-pressed={filter === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section aria-label="Product listings" aria-live="polite">
            {filtered.length === 0 ? (
              <p className={styles.emptyMsg} role="status">
                No products found.
              </p>
            ) : (
              <ul
                className={styles.grid}
                role="list"
                aria-label={`${filtered.length} product${filtered.length > 1 ? "s" : ""} found`}
              >
                {filtered.map((product) => (
                  <li key={product.id} role="listitem">
                    <ProductCard product={product} onAdd={handleAdd} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>

        {isCartOpen && (
          <CartDrawer
            cart={cart}
            onClose={handleToggleCart}
            onChangeQty={handleChangeQty}
            onRemove={handleRemove}
          />
        )}

        {notification && (
          <div
            className={styles.toast}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span aria-hidden="true">✓</span> {notification.message}
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(Luxora);