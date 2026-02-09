import type { Skill, SkillLevel, SkillStatus } from '@/types/skill'

type SkillFilters = {
  status?: SkillStatus | 'all'
  level?: SkillLevel | 'all'
  search?: string
}

export const useSkills = () => {
  const supabase = useSupabase()
  const skills = useState<Skill[]>('skills', () => [])
  const loading = useState<boolean>('skills-loading', () => false)
  const error = useState<string | null>('skills-error', () => null)

  const fetchSkills = async (filters: SkillFilters = {}, userId?: string) => {
    loading.value = true
    error.value = null

    const effectiveUserId = userId && userId !== 'anon' ? userId : undefined
    if (!effectiveUserId) {
      skills.value = []
      loading.value = false
      return
    }

    let query = supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('user_id', effectiveUserId)

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.level && filters.level !== 'all') {
      query = query.eq('level', filters.level)
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim()
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      error.value = fetchError.message
    } else {
      skills.value = data ?? []
    }
    loading.value = false
  }

  const fetchSkillById = async (id: string, userId?: string) => {
    if (!userId || userId === 'anon') {
      throw new Error('User ID required')
    }
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    return data as Skill
  }

  const createSkill = async (payload: {
    title: string
    description: string | null
    level: SkillLevel
    status: SkillStatus
    user_id: string
    estimate_minutes?: number | null
  }) => {
    const { data, error: insertError } = await supabase
      .from('skills')
      .insert(payload)
      .select('*')
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    skills.value = [data as Skill, ...skills.value]
    return data as Skill
  }

  const updateSkill = async (
    id: string,
    payload: Partial<Omit<Skill, 'id' | 'created_at'>>,
    userId?: string
  ) => {
    if (!userId || userId === 'anon') {
      throw new Error('User ID required')
    }
    const { data, error: updateError } = await supabase
      .from('skills')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    skills.value = skills.value.map((item) =>
      item.id === id ? (data as Skill) : item
    )
    return data as Skill
  }

  const deleteSkill = async (id: string, userId?: string) => {
    if (!userId || userId === 'anon') {
      throw new Error('User ID required')
    }
    const { error: deleteError } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    skills.value = skills.value.filter((item) => item.id !== id)
  }

  const subscribeToSkills = (onChange: () => void) => {
    const channel = supabase
      .channel('skills-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skills' },
        () => onChange()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    skills,
    loading,
    error,
    fetchSkills,
    fetchSkillById,
    createSkill,
    updateSkill,
    deleteSkill,
    subscribeToSkills
  }
}
