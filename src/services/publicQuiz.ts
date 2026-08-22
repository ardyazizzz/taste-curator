import { requireSupabase } from '../lib/supabase'
import type { Database, PublicQuizPayload, Rating } from '../types/database'

type PublicQuizError = Error | null

export async function getPublicQuiz(clientSlug: string, quizSlug: string, accessToken: string): Promise<{ data: PublicQuizPayload | null; error: PublicQuizError }> {
  try {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('get_public_quiz', {
      p_client_slug: clientSlug,
      p_quiz_slug: quizSlug,
      p_access_token: accessToken,
    })

    return { data: data as Database['public']['Functions']['get_public_quiz']['Returns'], error }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to load this quiz.') }
  }
}

export async function savePublicResponse(accessToken: string, quizItemId: string, rating: Rating) {
  try {
    const supabase = requireSupabase()
    const { data, error } = await supabase.rpc('save_public_response', {
      p_access_token: accessToken,
      p_quiz_item_id: quizItemId,
      p_rating: rating,
    })

    return { data, error }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error('Unable to save this choice.') }
  }
}
