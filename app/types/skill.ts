export type SkillStatus = 'planned' | 'active' | 'paused' | 'done' | 'archived'
export type SkillLevel = 'easy' | 'medium' | 'hard'

export type Skill = {
  id: string
  title: string
  description: string | null
  level: SkillLevel
  status: SkillStatus
  created_at: string
  user_id: string | null
  estimate_minutes?: number | null
  parent_id?: string | null
}

export type SkillLog = {
  id: string
  skill_id: string
  note: string | null
  minutes: number
  created_at: string
}

export type Favorite = {
  id: string
  skill_id: string
  user_id: string
}

/** Direction from from_skill_id to to_skill_id (inverse label when viewing the other skill) */
export type SkillLinkType = 'blocks' | 'relates_to' | 'duplicates'

export type SkillLink = {
  id: string
  from_skill_id: string
  to_skill_id: string
  link_type: SkillLinkType
  created_at: string
}
