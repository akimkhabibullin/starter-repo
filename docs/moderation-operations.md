# Moderation operations

This starter provides report submission, user blocking, content status controls, and realtime removal hooks. It does not automatically moderate content. A trained, authorized human remains responsible for reviewing reports and responding promptly.

## Access and responsibilities

- Restrict Supabase Dashboard and production database access to named operators with MFA and least privilege.
- Never give ordinary app users `service_role`, Dashboard access, or direct write access to moderation status fields.
- Establish an on-call owner and a documented response target appropriate for the product and jurisdiction before launch.
- Keep production support/contact details current outside this starter before distribution.

## Review queue

1. In an authenticated administrative environment, inspect pending rows in `public.content_reports`. Ordinary clients cannot select this table.
2. Join only the targeted `map_item_id` or `map_update_id` needed for the review. Treat reporter IDs and report details as sensitive operational data.
3. Review the content against the product's published community rules. Do not infer a violation solely from report volume.
4. Record the decision, operator, timestamp, and concise rationale in the organization's protected case-management system. The generic schema intentionally does not pretend to be a complete moderation case system.
5. If content violates policy, update its `moderation_status` to `hidden` for investigation or `removed` for a final removal. RLS immediately omits both states from ordinary reads; Realtime invalidates mounted clients.
6. If the report is not actionable, leave the content `visible` and close the protected case record.
7. Escalate credible threats, child-safety issues, or legal requests using the organization's approved safety/legal process. Do not expose reporter identity to the reported user.

Example operator SQL must be executed only in a reviewed, authenticated administrative session after replacing and validating the target UUID:

```sql
begin;

update public.map_items
set moderation_status = 'hidden'
where id = 'REPLACE_WITH_VALIDATED_MAP_ITEM_UUID';

commit;
```

Use the equivalent protected update on `public.map_updates` for an update target. Never copy a placeholder command directly into production.

## Verification and audit

- Confirm the target disappears for an ordinary test user and remains absent after relaunch.
- Confirm an unrelated visible record remains readable.
- Confirm the reporter cannot enumerate reports and the reported user cannot see reporter identity.
- Preserve protected audit evidence according to the organization's retention policy without copying free text or precise coordinates into analytics or crash reporting.
- Review unresolved cases and operator access regularly; rotate credentials immediately after personnel or vendor changes.

## Incident recovery

If moderation controls fail, disable new UGC creation through a reviewed server-side release or maintenance mechanism, preserve evidence, and restore only after RLS, report intake, blocking, and operator access have been verified. Do not claim automated filtering or timely response unless the product owner has staffed and tested those processes.
