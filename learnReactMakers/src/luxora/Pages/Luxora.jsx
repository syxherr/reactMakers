import React, { useReducer, useCallback } from "react";
import styles from "./Luxora.module.css";

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

const CATEGORIES = ["All", "Electronics", "Accessories"];
const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

const initialState = {
  cart: [],
  filter: "All",
  search: "",
  isCartOpen: false,
  notification: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const inCart = state.cart.find((item) => item.id === action.product.id);
      const newCart = inCart
        ? state.cart.map((item) =>
            item.id === action.product.id
              ? { ...item, qty: item.qty + 1 }
              : item,
          )
        : [...state.cart, { ...action.product, qty: 1 }];
      return {
        ...state,
        cart: newCart,
        notification: {
          message: `${action.product.name} ditambahkan ke keranjang!`,
        },
      };
    }

    case "REMOVE_FROM_CART": {
      const removedItem = state.cart.find((item) => item.id === action.id);
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.id),
        notification: {
          message: removedItem
            ? `${removedItem.name} dihapus dari keranjang!`
            : "Produk dihapus!",
        },
      };
    }

    case "CHANGE_QUANTITY": {
      const targetItem = state.cart.find((item) => item.id === action.id);
      if (!targetItem) return state;
      const newQty = targetItem.qty + action.delta;

      //contoh reduce kalau qty habis, item langsung dihapus dari cart
      if (newQty <= 0)
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== action.id),
        };
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.id ? { ...item, qty: newQty } : item,
        ),
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
function ProductCard({ product, onAdd }) {
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

function CartDrawer({ cart, onClose, onChangeQty, onRemove }) {
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

  const handleAdd = useCallback( //1. contoh nambah produk
    (product) => dispatch({ type: "ADD_TO_CART", product }),
    [],
  );

  const handleRemove = useCallback(
    (id) => dispatch({ type: "REMOVE_FROM_CART", id }),
    [],
  );

  const handleChangeQty = useCallback(
    (id, delta) => dispatch({ type: "CHANGE_QUANTITY", id, delta }),
    [],
  );

  const handleToggleCart = useCallback(
    () => dispatch({ type: "TOGGLE_CART" }),
    [],
  );

  const handleSearch = useCallback(
    (value) => dispatch({ type: "SET_SEARCH", value }),
    [],
  );

  const handleFilter = useCallback(
    (value) => dispatch({ type: "FILTER_CATEGORY", value }),
    [],
  );

  if (notification) {
    setTimeout(() => dispatch({ type: "CLEAR_NOTIFICATION" }), 3000);
  }

  return (
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
  );
}
export default React.memo(Luxora);
