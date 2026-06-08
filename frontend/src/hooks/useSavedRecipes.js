import { useState, useEffect, useCallback } from "react";

const COOKIE_KEY = 'dinnerdrop_saved_recipes';

const readCookie = () => {
  if (typeof document === 'undefined') return [];
  const parts = document.cookie.split('; ').find(p => p.startsWith(COOKIE_KEY + '='));
  if (!parts) return [];
  try {
    const raw = parts.split('=')[1] || '';
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return [];
  }
};

const writeCookie = (value) => {
  if (typeof document === 'undefined') return;
  try {
    const serialized = encodeURIComponent(JSON.stringify(value));
    // session cookie (no Expires) so it lasts for the browser session
    document.cookie = `${COOKIE_KEY}=${serialized}; path=/`;
  } catch {
    // ignore
  }
};

export const useSavedRecipes = () => {
  const [saved, setSaved] = useState(() => readCookie());
  const [savedIds, setSavedIds] = useState(() => new Set(readCookie().map((r) => String(r.recipe_api_id))));

  useEffect(() => {
    writeCookie(saved);
    setSavedIds(new Set(saved.map((r) => String(r.recipe_api_id))));
  }, [saved]);

  const save = useCallback(async (recipe) => {
    if (savedIds.has(String(recipe.recipeApiId))) return;
    const record = {
      recipe_api_id: String(recipe.recipeApiId),
      title: recipe.title,
      image_url: recipe.imageUrl,
      saved_at: new Date().toISOString(),
    };
    setSaved((prev) => [record, ...prev]);
  }, [savedIds]);

  const remove = useCallback(async (recipeApiId) => {
    setSaved((prev) => prev.filter((r) => r.recipe_api_id !== String(recipeApiId)));
  }, []);

  const isSaved = useCallback(
    (recipeApiId) => savedIds.has(String(recipeApiId)),
    [savedIds]
  );

  return { saved, save, remove, isSaved };
};