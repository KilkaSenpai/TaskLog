import type { SkillLog } from '@/types/skill'

export const useLogs = () => {
  const supabase = useSupabase()
  const logs = useState<SkillLog[]>('skill-logs', () => [])
  const loading = useState<boolean>('logs-loading', () => false)
  const error = useState<string | null>('logs-error', () => null)

  const fetchLogs = async (skillId?: string) => {
    loading.value = true
    error.value = null

    let query = supabase
      .from('skill_logs')
      .select('*')
      .order('created_at', { ascending: false })

    if (skillId) {
      query = query.eq('skill_id', skillId)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      error.value = fetchError.message
    } else {
      logs.value = data ?? []
    }
    loading.value = false
  }

  const fetchLogsSince = async (fromIso: string) => {
    const { data, error: fetchError } = await supabase
      .from('skill_logs')
      .select('*')
      .gte('created_at', fromIso)
      .order('created_at', { ascending: false })

    if (fetchError) {
      throw new Error(fetchError.message)
    }

    return (data ?? []) as SkillLog[]
  }

  const createLog = async (payload: {
    skill_id: string
    note: string | null
    minutes: number
  }) => {
    const { data, error: insertError } = await supabase
      .from('skill_logs')
      .insert(payload)
      .select('*')
      .single()

    if (insertError) {
      throw new Error(insertError.message)
    }

    logs.value = [data as SkillLog, ...logs.value]
    return data as SkillLog
  }

  const deleteLog = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('skill_logs')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    logs.value = logs.value.filter((item) => item.id !== id)
  }

  const subscribeToLogs = (onChange: () => void) => {
    const channel = supabase
      .channel('skill-logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skill_logs' },
        () => onChange()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchLogsSince,
    createLog,
    deleteLog,
    subscribeToLogs
  }
}
