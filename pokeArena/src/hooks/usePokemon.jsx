import { useState, useEffect } from "react";

const API_LIST = "https://pokeapi.co/api/v2/pokemon?limit=1302&offset=0";
const API_DETAIL = (name) => `https://pokeapi.co/api/v2/pokemon/${name}`;
const CACHE_KEY = "pokemon_list_cache";

export function usePokemonList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // 1. cached API to localStorage
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          setList(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const res = await fetch(API_LIST);
        const data = await res.json();
        const parsed = data.results.map((p, i) => ({
          id: i + 1,
          name: p.name,
        }));

        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        setList(parsed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { list, loading, error };
}

// fecth ke API, mentah ke objek yg dibutuhin aja
export async function fetchPokemonDetail(name) {
  const res = await fetch(API_DETAIL(name)); // fecth ke API
  const data = await res.json();

  const stats = {};
  data.stats.forEach((s) => {
    stats[s.stat.name] = s.base_stat;
  });

  return {
    id: data.id, // id
    name: data.name, // nama
    types: data.types.map((t) => t.type.name), // tipe
    sprite: data.sprites.front_default, // gambar
    stats, //stats
  };
}