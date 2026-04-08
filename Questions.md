# Questions I Would Have Asked

Before starting I wrote down the things that werent clear to me in the brief. 
Listed here as I wouldve asked them in a real kickoff meeting.

1. **Registration flow** — should clients be able to sign up themselves or does an admin create their account? I went with admin-only registration since this is described as an internal platform, but this changes significantly if clients are external customers signing up on their own.

2. **Job reassignment** — can a job be reassigned after work has already started? I allowed it (admin can always reassign) but wasnt sure if thats the right call operationally.

3. **Notifications** — the brief said "relevant parties should be informed" but didnt specify how. Email, SMS, in-app? I went with in-app DB notifications since it runs locally without any third party setup. Would have confirmed this before building.

4. **Client portal** — separate subdomain or restricted view in the same app? I went with same app, different routes, protected by role. Easier to maintain one codebase.

5. **Technician availability** — should the system prevent assigning a technician who already has an active job at the same time? Right now there's no double-booking check. Would want to know if thats required.

6. **Who can cancel a job** — I let technicians cancel their own assigned jobs and admin can cancel anything. Wasnt sure if clients should also be able to cancel.

7. **Data retention** — should deleted users or jobs be permanently removed or soft deleted? I went with hard deletes for simplicity but I think soft deletes with restore would be better for production.

