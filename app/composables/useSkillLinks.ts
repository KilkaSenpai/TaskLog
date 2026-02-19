import type { SkillLink, SkillLinkType } from '@/types/skill'

const LINK_TYPE_LABELS_OUTWARD: Record<SkillLinkType, string> = {
  blocks: 'Блокує',
  relates_to: 'Пов’язана з',
  duplicates: 'Дублікат'
}

const LINK_TYPE_LABELS_INWARD: Record<SkillLinkType, string> = {
  blocks: 'Заблокована',
  relates_to: 'Пов’язана з',
  duplicates: 'Дубльована'
}

export const useSkillLinks = () => {
  const supabase = useSupabase()

  const getOutwardLabel = (linkType: SkillLinkType) => LINK_TYPE_LABELS_OUTWARD[linkType]
  const getInwardLabel = (linkType: SkillLinkType) => LINK_TYPE_LABELS_INWARD[linkType]

  /** All links where the given skill is either from or to */
  const fetchLinksBySkillId = async (skillId: string): Promise<SkillLink[]> => {
    const { data: out, error: errOut } = await supabase
      .from('skill_links')
      .select('*')
      .eq('from_skill_id', skillId)
      .order('created_at', { ascending: true })

    if (errOut) return []

    const { data: inData, error: errIn } = await supabase
      .from('skill_links')
      .select('*')
      .eq('to_skill_id', skillId)
      .order('created_at', { ascending: true })

    if (errIn) return (out ?? []) as SkillLink[]

    const outgoing = (out ?? []).map((r) => ({ ...r, from_skill_id: r.from_skill_id, to_skill_id: r.to_skill_id }))
    const incoming = (inData ?? []).map((r) => ({ ...r, from_skill_id: r.from_skill_id, to_skill_id: r.to_skill_id }))
    return [...(outgoing as SkillLink[]), ...(incoming as SkillLink[])]
  }

  const createLink = async (payload: {
    from_skill_id: string
    to_skill_id: string
    link_type: SkillLinkType
  }) => {
    if (payload.from_skill_id === payload.to_skill_id) {
      throw new Error('Задачу не можна пов’язати з собою.')
    }
    const { data, error } = await supabase
      .from('skill_links')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    return data as SkillLink
  }

  const deleteLink = async (linkId: string) => {
    const { error } = await supabase.from('skill_links').delete().eq('id', linkId)
    if (error) throw new Error(error.message)
  }

  return {
    getOutwardLabel,
    getInwardLabel,
    fetchLinksBySkillId,
    createLink,
    deleteLink
  }
}
