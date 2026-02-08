import type { Favorite } from '@/types/skill'

export const useFavorites = () => {
  const supabase = useSupabase()
  const favorites = useState<Favorite[]>('favorites', () => [])
  const loading = useState<boolean>('favorites-loading', () => false)
  const error = useState<string | null>('favorites-error', () => null)

  const fetchFavorites = async (userId: string) => {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      error.value = fetchError.message
    } else {
      favorites.value = data ?? []
    }
    loading.value = false
  }

  const toggleFavorite = async (skillId: string, userId: string) => {
    const existing = favorites.value.find(
      (favorite) => favorite.skill_id === skillId && favorite.user_id === userId
    )

    if (existing) {
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      favorites.value = favorites.value.filter(
        (favorite) => favorite.id !== existing.id
      )
      return false
    }

    const { data, error: insertError } = await supabase
      .from('favorites')
      .insert({ skill_id: skillId, user_id: userId })
      .select('*')
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    favorites.value = [data as Favorite, ...favorites.value]
    return true
  }

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    toggleFavorite
  }
}
