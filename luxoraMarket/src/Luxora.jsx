import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./Luxora.module.css";

import {
  addToCart,
  removeFromCart,
  changeQuantity,
  setFilter,
  setSearch,
  toggleCart,
  clearNotification,
  selectItems,
  selectFilter,
  selectSearch,
  selectIsCartOpen,
  selectNotification,
  selectTotalItems,
} from "./cartSlice";

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

// ─── PRODUCT CARD ─────────────────────────────────────────────
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

// ui
function Luxora() {
  const dispatch = useDispatch();

  const cart = useSelector(selectItems); //array product di keranjang
  const filter = useSelector(selectFilter); //filter kategori
  const search = useSelector(selectSearch); //input pencarian
  const isCartOpen = useSelector(selectIsCartOpen); //true, cardtdrawer di render, false drawe ilang
  const notification = useSelector(selectNotification); //muncul setelah add/remove item
  const totalItems = useSelector(selectTotalItems); //menjumlahkan semua qty dari setiap item

  const filtered = PRODUCTS.filter(
    (p) =>
      (filter === "All" || p.category === filter) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = useCallback( //2. membawa “perintah” dari UI ke Redux
    (product) => dispatch(addToCart(product)),
    [dispatch],
  );

  const handleRemove = useCallback(
    (id) => dispatch(removeFromCart(id)),
    [dispatch],
  );

  const handleChangeQty = useCallback(
    (id, delta) => dispatch(changeQuantity({ id, delta })),
    [dispatch],
  );

  const handleToggleCart = useCallback(
    () => dispatch(toggleCart()),
    [dispatch],
  );

  const handleSearch = useCallback(
    (value) => dispatch(setSearch(value)),
    [dispatch],
  );

  const handleFilter = useCallback(
    (value) => dispatch(setFilter(value)),
    [dispatch],
  );

  if (notification) {
    setTimeout(() => dispatch(clearNotification()), 3000);
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
          <ProductCard key={product.id} product={product} onAdd={handleAdd} /> //1. ketika klik, memanggil onAdd(product)
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
