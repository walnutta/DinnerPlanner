import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = 'dinnerdrop_saved_recipes';

const loadSavedRecipes = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useSavedRecipes = () => {
  const [saved, setSaved] = useState(() => loadSavedRecipes());
  const [savedIds, setSavedIds] = useState(() => new Set(loadSavedRecipes().map((r) => String(r.recipe_api_id))));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
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