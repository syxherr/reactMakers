import React, { useReducer, useCallback } from "react";
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
  | { type: "ADD_TO_CART"; product: (typeof PRODUCTS)[0] }
  | { type: "REMOVE_FROM_CART"; id: number }
  | { type: "CHANGE_QUANTITY"; id: number; delta: number }
  | { type: "FILTER_CATEGORY"; value: string }
  | { type: "SET_SEARCH"; value: string }
  | { type: "TOGGLE_CART" }
  | { type: "CLEAR_NOTIFICATION" };

const CATEGORIES = ["All", "Electronics", "Accessories"];
const fmt = (n: number): string => "Rp " + n.toLocaleString("id-ID");

const CART_KEY = "luxora_cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
  
}
function saveCart(cart: CartItem[]): void{
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
            item.id === action.product.id ? { ...item, qty: item.qty + 1 } : item,
          )
        : [...state.cart, { ...action.product, qty: 1 }];
      saveCart(newCart);
      return {
        ...state,
        cart: newCart,
        notification: { message: `${action.product.name} ditambahkan ke keranjang!` },
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
          message: removedItem ? `${removedItem.name} dihapus dari keranjang!` : "Produk dihapus!",
        },
      };
    }

    case "CHANGE_QUANTITY": {
      const targetItem = state.cart.find((item) => item.id === action.id);
      if (!targetItem) return state;
      const newQty = targetItem.qty + action.delta;

      //contoh reduce kalau qty habis, item langsung dihapus dari cart
      if (newQty <= 0) {
        const newCart = state.cart.filter((item) => item.id !== action.id);
        saveCart(newCart);
        return {
          ...state,
          cart: newCart,
        };
      }
      const newCart = state.cart.map((item) =>
        item.id === action.id ? { ...item, qty: newQty } : item,
      );
      saveCart(newCart);
      return {
        ...state,
        cart: newCart,
      };
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
 
interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onChangeQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}

function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardImg} style={{ background: product.color }}>
        {product.thumbnail}
      </div>
      <div className={styles.cardBody}>
        <p className={styles.cardName}>{product.name}</p>
        <p className={styles.cardPrice}>{fmt(product.price)}</p>
        <p className={styles.cardSold}>🛒 {product.sold} Sold</p>

        {/* 3. function dipanggil saat tombol diklik */}
        <button className={styles.addBtn} onClick={() => onAdd(product)}>
          + Keranjang
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onChangeQty, onRemove }: CartDrawerProps) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHead}>
          <h2>Keranjang 🛒</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          {cart.length === 0 ? (
            <p className={styles.emptyMsg}>Keranjang masih Kosong</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartEmoji}>{item.thumbnail}</div>
                <div className={styles.cartInfo}>
                  <p className={styles.cartName}>{item.name}</p>
                  <p className={styles.cartPrice}>{fmt(item.price)}</p>
                  <div className={styles.qtyRow}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onChangeQty(item.id, -1)}
                    >
                      −
                    </button>
                    <span className={styles.qtyNum}>{item.qty}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => onChangeQty(item.id, +1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => onRemove(item.id)}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.drawerFoot}>
            <div className={styles.totalRow}>
              <span>Total:</span>
              <span className={styles.totalAmount}>{fmt(total)}</span>
            </div>
            <button className={styles.checkoutBtn}>Checkout →</button>
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
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = useCallback(
    //1. contoh nambah produk
    (product: Product) => dispatch({ type: "ADD_TO_CART", product }),
    [],
  );

  const handleRemove = useCallback(
    (id: number) => dispatch({ type: "REMOVE_FROM_CART", id }),
    [],
  );

  const handleChangeQty = useCallback(
    (id: number, delta: number) => dispatch({ type: "CHANGE_QUANTITY", id, delta }),
    [],
  );

  const handleToggleCart = useCallback(
    () => dispatch({ type: "TOGGLE_CART" }),
    [],
  );

  const handleSearch = useCallback(
    (value: string) => dispatch({ type: "SET_SEARCH", value }),
    [],
  );

  const handleFilter = useCallback(
    (value: string) => dispatch({ type: "FILTER_CATEGORY", value }),
    [],
  );

  if (notification) {
    setTimeout(() => dispatch({ type: "CLEAR_NOTIFICATION" }), 3000);
  }

  return (
    <>
    <Helmet>
      <title>Luxora Shop</title>
      <meta name="description" content="Marketplace for electronics and accessories" />
    </Helmet>
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <span className={styles.logo}>✦ Luxora Shop</span>
        <button className={styles.cartBtn} onClick={handleToggleCart}>
          Keranjang 🛒
          {totalItems > 0 && <span className={styles.badge}>{totalItems}</span>}
        </button>
      </nav>

      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${filter === cat ? styles.active : ""}`}
            onClick={() => handleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={handleAdd} /> //2. function dikirim
        ))}
      </div>

      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={handleToggleCart}
          onChangeQty={handleChangeQty}
          onRemove={handleRemove}
        />
      )}

      {notification && (
        <div className={styles.toast}>✓ {notification.message}</div>
      )}
    </div>
    </>
  );
}
export default React.memo(Luxora);
