import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
        status: 405,
        headers: { ...JSON_HEADERS, Allow: 'POST' },
      });
    }

    const userId = context.userClaims.sub;
    if (!userId) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: JSON_HEADERS,
      });
    }

    const { data, error: lookupError } = await context.supabaseAdmin.auth.admin.getUserById(userId);

    if (lookupError?.status === 404) {
      return new Response(JSON.stringify({ deleted: true }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    }

    if (lookupError || !data.user) {
      console.error('Account deletion identity lookup failed.');
      return new Response(JSON.stringify({ error: 'deletion_temporarily_unavailable' }), {
        status: 503,
        headers: JSON_HEADERS,
      });
    }

    const hasAppleIdentity = data.user.identities?.some(
      (identity) => identity.provider === 'apple',
    );
    if (hasAppleIdentity) {
      return new Response(JSON.stringify({ error: 'apple_reauthentication_required' }), {
        status: 409,
        headers: JSON_HEADERS,
      });
    }

    const { error: deleteError } = await context.supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Account deletion failed.');
      return new Response(JSON.stringify({ error: 'deletion_temporarily_unavailable' }), {
        status: 503,
        headers: JSON_HEADERS,
      });
    }

    return new Response(JSON.stringify({ deleted: true }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }),
};
