# Campus OD Tracker

A React + Vite prototype for managing campus-only on-duty requests across student, staff, and HOD workspaces. Records are stored in this browser's `localStorage`; they are not secure or shared between users or devices. Demo role checks are client-side only.

## Run locally

Install Node.js 20+ and npm, then from this folder:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build, run `npm run build` and `npm run preview`.
Run the built-in validation and CSV tests with `npm test`.

## Demo walkthrough

1. **Student:** Choose the student demo account (`ananya@campus.demo`), open **New OD request**, and submit a future campus activity. Empty fields, past dates, invalid time ranges, and overlapping active requests are rejected. The request appears as pending in the history.
2. **Staff:** Sign out, choose the faculty account (`meera@campus.demo`), open the pending request, and approve it or reject it with a reason. Add optional remarks. The student and HOD workspaces receive in-app notifications.
3. **Student activity:** Sign in again as the student. Approved requests show the destination and time period; submit a progress update or mark the activity complete. Updates and completion are visible to staff and the HOD.
4. **HOD:** Sign out and choose (`arjun@campus.demo`) to see department totals, monthly volume, outcomes, destination and purpose statistics, records, staff review details, and CSV export. Use search and filters on **OD records** to narrow the export.
5. **Persistence:** Refresh the page, then sign in again; local demo records remain in this browser. Use **Reset demo data** in the sidebar to restore the initial examples.

Optional supporting files are limited to 1 MB and saved in local browser storage. Activity updates are self-reported: this prototype does not implement QR verification, GPS, or background tracking. Firebase Authentication and Firestore should replace the demo access and local storage before real deployment; backend authorization is required for security.
