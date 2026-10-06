import { useEffect } from "react"
import { useAppDispatch } from "@/app/hooks"
import { setSession } from "@/features/auth/authSlice"
import { toAuthUser } from "@/lib/auth"
import { supabase } from "@/lib/supabaseClient"

/** Mounted once near the root — keeps the auth slice in sync with Supabase's session. */
export function AuthListener() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!supabase) {
      dispatch(setSession(null))
      return
    }

    supabase.auth.getSession().then(async ({ data }) => {
      dispatch(setSession(await toAuthUser(data.session?.user ?? null)))
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      dispatch(setSession(await toAuthUser(session?.user ?? null)))
    })

    return () => subscription.subscription.unsubscribe()
  }, [dispatch])

  return null
}
