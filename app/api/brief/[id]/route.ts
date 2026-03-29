import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { parseBriefRow } from '@/lib/supabase/helpers'
import { FIELD_NAMES } from '@/lib/types'
import type { BriefRow } from '@/lib/types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'Invalid brief ID format' },
      { status: 400 }
    )
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      )
    }

    const brief = parseBriefRow(data as BriefRow)

    return NextResponse.json({ brief })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Validate UUID format
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'Invalid brief ID format' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const {
      field,
      content,
      anonymousId,
      structured_brief,
      audit_results,
      score,
      client_inputs,
    } = body as {
      field?: string
      content?: string
      anonymousId?: string
      structured_brief?: Record<string, unknown>
      audit_results?: Record<string, unknown>
      score?: number
      client_inputs?: Record<string, unknown>
    }

    const supabase = createServerClient()

    // -----------------------------------------------------------------------
    // Code path: client_inputs (Brief Vivo — no anonymousId required)
    // -----------------------------------------------------------------------
    if (client_inputs !== undefined && !anonymousId) {
      // Fetch existing brief to check share_enabled
      const { data: existingData, error: fetchError } = await supabase
        .from('briefs')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existingData) {
        return NextResponse.json(
          { error: 'Brief not found' },
          { status: 404 }
        )
      }

      const existingRow = existingData as BriefRow

      // Only shared briefs accept client_inputs
      if (!existingRow.share_enabled) {
        return NextResponse.json(
          { error: 'Brief is not shared' },
          { status: 403 }
        )
      }

      // Merge new client_inputs with existing ones
      const now = new Date().toISOString()
      const mergedClientInputs = {
        ...(existingRow.client_inputs as Record<string, unknown>),
        ...client_inputs,
      }

      // Also merge client_inputs into structured_brief so the data is ready
      // for re-audit (score is NOT recalculated here — only on re-audit).
      // GUARD: only merge inputs that are NEW (not already processed in a
      // previous PATCH). This prevents duplication when a re-audit changes
      // the field status back to "partial" and a subsequent PATCH re-iterates
      // the same client_inputs.
      const previousClientInputs = (existingRow.client_inputs ?? {}) as Record<string, unknown>
      const existingBrief = (existingRow.structured_brief ?? {}) as Record<string, unknown>
      const mergedStructuredBrief = { ...existingBrief }
      for (const fieldName of FIELD_NAMES) {
        const clientValue = mergedClientInputs[fieldName]
        if (typeof clientValue === 'string' && (clientValue as string).trim()) {
          // Skip if this exact input was already processed before
          if (clientValue === previousClientInputs[fieldName]) continue

          const existingField = existingBrief[fieldName] as Record<string, unknown> | undefined
          const existingStatus = existingField?.status as string | undefined
          if (!existingStatus || existingStatus === 'missing') {
            mergedStructuredBrief[fieldName] = {
              content: clientValue,
              status: 'complete',
            }
          } else if (existingStatus === 'partial') {
            mergedStructuredBrief[fieldName] = {
              content: String(existingField?.content ?? '') + '\n\n— Complemento do cliente:\n' + clientValue,
              status: 'complete',
              suggestion: existingField?.suggestion,
            }
          }
          // If already complete, don't override
        }
      }

      // NOTE: We intentionally do NOT recalculate the score here. The score
      // should only update after a re-audit (manual or automatic when the
      // client finishes all fields). Updating it on every field save causes
      // confusing score oscillations for the owner watching in real-time.

      const updatePayload: Record<string, unknown> = {
        client_inputs: mergedClientInputs,
        structured_brief: mergedStructuredBrief,
        client_last_seen: now,
        updated_at: now,
      }

      const { data: updatedData, error: updateError } = await supabase
        .from('briefs')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (updateError || !updatedData) {
        return NextResponse.json(
          { error: 'Failed to update brief' },
          { status: 500 }
        )
      }

      const brief = parseBriefRow(updatedData as BriefRow)

      return NextResponse.json({ brief })
    }

    // -----------------------------------------------------------------------
    // Code path: owner update (requires anonymousId)
    // -----------------------------------------------------------------------

    // Validate anonymousId is present
    if (!anonymousId) {
      return NextResponse.json(
        { error: 'Missing anonymousId' },
        { status: 400 }
      )
    }

    // For individual field update, validate field name
    if (field !== undefined) {
      if (!(FIELD_NAMES as readonly string[]).includes(field)) {
        return NextResponse.json(
          { error: 'Invalid field name' },
          { status: 400 }
        )
      }
    }

    // Fetch existing brief to verify ownership
    const { data: existingData, error: fetchError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingData) {
      return NextResponse.json(
        { error: 'Brief not found' },
        { status: 404 }
      )
    }

    const existingRow = existingData as BriefRow

    // Verify anonymous_id ownership
    if (existingRow.anonymous_id !== anonymousId) {
      return NextResponse.json(
        { error: 'Unauthorized: anonymous_id does not match brief owner' },
        { status: 403 }
      )
    }

    // Build update payload
    const now = new Date().toISOString()
    let updatedStructuredBrief: Record<string, unknown>

    if (field !== undefined && content !== undefined) {
      // Individual field update — merge specific field into existing structured_brief
      const existingBrief = existingRow.structured_brief as Record<string, unknown>
      updatedStructuredBrief = {
        ...existingBrief,
        [field]: {
          content,
          status: content.trim() ? 'complete' : 'missing',
        },
      }
    } else if (structured_brief !== undefined) {
      // Full structured_brief update
      updatedStructuredBrief = structured_brief
    } else {
      return NextResponse.json(
        { error: 'Missing field/content or structured_brief in request body' },
        { status: 400 }
      )
    }

    // Build the update object
    const updatePayload: Record<string, unknown> = {
      structured_brief: updatedStructuredBrief,
      updated_at: now,
    }

    // Include audit_results if provided (e.g. from re-audit flow)
    if (audit_results !== undefined && typeof audit_results === 'object') {
      updatePayload.audit_results = audit_results
    }

    // Include score if provided (e.g. from re-audit flow)
    if (score !== undefined && typeof score === 'number') {
      updatePayload.score = score
    }

    // Update in Supabase
    const { data: updatedData, error: updateError } = await supabase
      .from('briefs')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !updatedData) {
      return NextResponse.json(
        { error: 'Failed to update brief' },
        { status: 500 }
      )
    }

    const brief = parseBriefRow(updatedData as BriefRow)

    return NextResponse.json({ brief })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
