import useSWR from "swr";
import { useState, useEffect } from "react";

const API_LIST = "https://pokeapi.co/api/v2/pokemon?limit=1302&offset=0";
const API_DETAIL = (name : string) => `https://pokeapi.co/api/v2/pokemon/${name}`;
const CACHE_KEY = "pokemon_list_cache";

export interface PokemonListItem {
  id: number;
  name:string;
}

export interface Pokemon {
  id: number;
  name: string;
  types: string;
  sprite: string | null;
  stats: Record<string, number>;
}

// 1. cached API to localStorage
async function fetchList(): Promise<PokemonListItem[]> {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) return JSON.parse(cached) as PokemonListItem[];

  const res = await fetch(API_LIST);
  const data = await res.json();
  const parsed: PokemonListItem[] = data.result.map(
    (p: { name: string }, i: number) => ({ id: i + 1, name: p.name })
  );
  localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
  return parsed;
}

export function UsePokemonList() {
  const { data, error, isLoading } = useSWR<PokemonListItem[]>(
    "pokemon-list",
    fetchList,
    { revalidateOnFocus: false }
  );

  return {
    list: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

export function usePokemonList() {
  const { data, error, isLoading } = useSWR<PokemonListItem[]>(
    "pokemon-list",
    fetchList,
    { revalidateOnFocus: false }
  );

  return {
    list: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
}

// fecth ke API, mentah ke objek yg dibutuhin aja
export async function fetchPokemonDetail(name: string): Promise<Pokemon> {
  const res = await fetch(API_DETAIL(name)); // fecth ke API
  const data = await res.json();

  const stats: Record<string, number> = {};
  data.stats.forEach((s: { stat: { name: string }; base_stat: number }) => {
    stats[s.stat.name] = s.base_stat;
  });

  return {
    id: data.id, // id
    name: data.name, // nama
    types:  data.types.map((t: { type: { name: string } }) => t.type.name), // tipe
    sprite: data.sprites.front_default ?? null, // gambar
    stats, //stats
  };
}