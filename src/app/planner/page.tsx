import { redirect } from 'next/navigation';

/** Old URL; planner lives at `/` now. */
export default function PlannerRedirectPage() {
  redirect('/');
}
