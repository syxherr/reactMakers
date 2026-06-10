import { useState, useRef, useEffect, useCallback, useMemo, memo, useId } from "react";
import ErrorBoundary from "../ErrorBoundary.jsx";
import { fetchPokemonDetail } from "../../hooks/usePokemon.jsx";
import styles from "./PokemonPicker.module.css";
import SwordAltIcon from "../../style/SwordAltIcon";
import Loading from "../Loading.jsx"

const TYPE_COLORS = {
  fire: "#FF6B35",
  water: "#4A90D9",
  grass: "#3ddc84",
  electric: "#F5C518",
  psychic: "#D4538A",
  ghost: "#7B5EA7",
  dragon: "#4A6FA5",
  dark: "#5C4A3A",
  poison: "#b87dff",
  normal: "#A8A878",
  flying: "#7ecfff",
  ice: "#74CCF4",
  rock: "#B5A642",
  ground: "#C4A35A",
  fighting: "#E07B39",
  bug: "#9CB820",
  steel: "#8C9DB5",
  fairy: "#EE99AC",
};

const PokemonPicker = memo(function PokemonPicker({
  pokemonList,
  listLoading,
  selected,
  onSelect,
  randomLoading,
}) {
  const handleSelectA = useCallback((poke) => onSelect(0, poke), [onSelect]);
  const handleSelectB = useCallback((poke) => onSelect(1, poke), [onSelect]);

  return (
    <div
      className={styles.picker}
      role="group"
      aria-label="Select two Pokémon to battle"
    >
      <SlotPicker
        label="Challenger 1"
        side="left"
        pokemonList={pokemonList}
        listLoading={listLoading}
        pokemon={selected[0]}
        onSelect={handleSelectA}
        randomLoading={randomLoading}
      />

      <div className={styles.vs} aria-hidden="true">
        <SwordAltIcon width={30} height={30} />
      </div>

      <SlotPicker
        label="Challenger 2"
        side="right"
        pokemonList={pokemonList}
        listLoading={listLoading}
        pokemon={selected[1]}
        onSelect={handleSelectB}
        randomLoading={randomLoading}
      />
    </div>
  );
});

export default PokemonPicker;

const SlotPicker = memo(function SlotPicker({
  label,
  side,
  pokemonList,
  listLoading,
  pokemon,
  onSelect,
  randomLoading,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const wrapRef = useRef(null);

  const inputId = useId();
  const listboxId = useId();

  // 2. autocomplete filter based on id
  const filtered = useMemo(() => {
    if (query.trim().length === 0) return pokemonList.slice(0, 80);
    return pokemonList
      .filter(
        (p) =>
          p.name.includes(query.toLowerCase()) ||
          String(p.id).padStart(3, "0").includes(query),
      )
      .slice(0, 60);
  }, [query, pokemonList]);

  // autocomplete tutup
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 3. call fetchPokemonDetail, hasil detailnya kirim data stats
  const handleSelect = useCallback(
    async (p) => {
      setQuery(capitalize(p.name));
      setOpen(false);
      setFetching(true);
      // fetch detail pokemon
      try {
        const detail = await fetchPokemonDetail(p.name);
        onSelect(detail);
      } catch {
        onSelect(null);
      } finally {
        setFetching(false);
      }
    },
    [onSelect],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onSelect(null);
  }, [onSelect]);

  // autocomplete kebuka
  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value);
    setOpen(true);
  }, []);

  const handleFocus = useCallback(() => setOpen(true), []);

  return (
    <div className={`${styles.slot} ${styles[side]}`}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>

      <div className={styles.autocompleteWrap} ref={wrapRef}>
        <div className={styles.inputRow}>
          <input
            id={inputId}
            className={styles.input}
            type="text"
            placeholder={listLoading ? "Loading…" : "Search Pokemon…"}
            value={query}
            disabled={listLoading}
            onChange={handleQueryChange}
            onFocus={handleFocus}
            autoComplete="off"
            role="combobox"
            aria-expanded={open && filtered.length > 0}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-busy={listLoading}
          />
          {query && (
            <button
              className={styles.clearBtn}
              onClick={handleClear}
              tabIndex={-1}
              aria-label={`Clear ${label} selection`}
            >
              ✕
            </button>
          )}
        </div>

      {/* dropdown filter */}
        {open && filtered.length > 0 && (
          <ul
            id={listboxId}
            className={styles.dropdown}
            aria-label={`${label} Pokémon options`}
          >
            {filtered.map((p) => (
              <li
                key={p.id}
                className={styles.dropdownItem}
                onMouseDown={() => handleSelect(p)}
                role="option"
                aria-selected={pokemon?.name === p.name}
              >
                <img
                  className={styles.dropThumb}
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                  alt=""
                  width={32}
                  height={32}
                />
                <span className={styles.dropName}>{capitalize(p.name)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PokemonCard
        pokemon={pokemon}
        loading={fetching || randomLoading}
        side={side}
      />
    </div>
  );
});

const PokemonCard = memo(function PokemonCard({ pokemon, loading, side }) {
  if (loading) {
    return (
      <div className={`${styles.card} ${styles[side]}`}>
        <Loading />
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className={`${styles.card} ${styles[side]}`}>
        <div
          className={styles.cardEmpty}
          role="img"
          aria-label="No Pokémon selected"
        >
          Choose Your Pokemon
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
    <article
      className={`${styles.card} ${styles[side]}`}
      aria-label={`${capitalize(pokemon.name)} — selected as ${side === "left" ? "Challenger 1" : "Challenger 2"}`}
    >
      {pokemon.sprite && (
        <img
          className={styles.sprite}
          src={pokemon.sprite}
          alt={`${capitalize(pokemon.name)} sprite`}
          width={96}
          height={96}
        />
      )}
      <div className={styles.cardInfo}>
        <div className={styles.cardName}>{capitalize(pokemon.name)}</div>

        <div
          className={styles.types}
          role="list"
          aria-label={`${capitalize(pokemon.name)} types`}
        >
          {pokemon.types.map((t) => (
            <TypePill key={t} type={t} />
          ))}
        </div>
      </div>
    </article>
    </ErrorBoundary>
  );
});

const TypePill = memo(function TypePill({ type }) {
  const color = TYPE_COLORS[type] ?? "#999";
  return (
    <span
      className={styles.typePill}
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
      }}
      role="listitem"
    >
      {type}
    </span>
  );
});

function capitalize(str = "") {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
