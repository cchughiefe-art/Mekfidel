import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient, createServiceRoleClient } from '@/lib/supabase/server';
import { applyActions, createAiPlan, rollbackActions } from '@/lib/ai-cms/server';
import { aiPlanSchema } from '@/lib/ai-cms/types';

const requestSchema = z.discriminatedUnion('operation', [
  z.object({ operation: z.literal('plan'), instruction: z.string().trim().min(3).max(2000) }),
  z.object({ operation: z.literal('apply'), requestId: z.string().uuid() }),
  z.object({ operation: z.literal('rollback'), requestId: z.string().uuid() }),
]);

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const auditClient = createServiceRoleClient();
    const { data, error } = await auditClient
      .from('ai_change_requests')
      .select('id,created_at,instruction,summary,status,applied_at,rolled_back_at,error')
      .order('created_at', { ascending: false })
      .eq('created_by', user.id)
      .limit(20);
    if (error) throw error;
    return NextResponse.json({ history: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');
    const auditClient = createServiceRoleClient();
    const input = requestSchema.parse(await request.json());

    if (input.operation === 'plan') {
      const plan = await createAiPlan(supabase, input.instruction);
      const { data, error } = await auditClient.from('ai_change_requests').insert({
        created_by: user.id,
        instruction: input.instruction,
        summary: plan.summary,
        actions: plan.actions,
        status: 'pending',
      }).select('id').single();
      if (error) throw error;
      return NextResponse.json({ requestId: data.id, plan });
    }

    const { data: changeRequest, error: fetchError } = await auditClient
      .from('ai_change_requests')
      .select('*')
      .eq('id', input.requestId)
      .eq('created_by', user.id)
      .single();
    if (fetchError) throw fetchError;

    if (input.operation === 'apply') {
      if (changeRequest.status !== 'pending') throw new Error('Only pending previews can be applied');
      const plan = aiPlanSchema.parse({ summary: changeRequest.summary, answer: '', warnings: [], actions: changeRequest.actions });
      const { data: locked, error: lockError } = await auditClient
        .from('ai_change_requests')
        .update({ status: 'applying', error: null })
        .eq('id', input.requestId)
        .eq('status', 'pending')
        .select('id');
      if (lockError || !locked?.length) throw new Error('This preview is already being processed');
      try {
        const rollback = await applyActions(supabase, plan.actions);
        const { error } = await auditClient.from('ai_change_requests').update({
          status: 'applied', applied_at: new Date().toISOString(), rollback_actions: rollback,
        }).eq('id', input.requestId);
        if (error) throw error;
        return NextResponse.json({ success: true });
      } catch (error) {
        await auditClient.from('ai_change_requests').update({
          status: 'failed', error: error instanceof Error ? error.message : 'Apply failed',
        }).eq('id', input.requestId);
        throw error;
      }
    }

    if (changeRequest.status !== 'applied') throw new Error('Only applied changes can be rolled back');
    await rollbackActions(supabase, changeRequest.rollback_actions || []);
    const { error } = await auditClient.from('ai_change_requests').update({
      status: 'rolled_back', rolled_back_at: new Date().toISOString(),
    }).eq('id', input.requestId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
