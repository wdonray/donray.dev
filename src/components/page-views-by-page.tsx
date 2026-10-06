import type { PageStat } from "@/lib/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Per-page breakdown of all-time tracked stats, most viewed first.
 * Renders nothing when there are no pages (the parent section only
 * renders once totalViews > 0, so this is a defensive guard).
 */
export function PageViewsByPage({ pages }: { pages: PageStat[] }) {
  if (pages.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Page views by page</CardTitle>
        <CardDescription>All time, most viewed first</CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <caption className="sr-only">
            Page views and unique visitors by page path, most viewed first
          </caption>
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="pb-2 pr-4 text-left font-medium">
                Page
              </th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">
                Page views
              </th>
              <th scope="col" className="pb-2 text-right font-medium">
                Unique visitors
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.path} className="border-t">
                <td className="py-2.5 pr-4 font-mono text-[13px] break-all">
                  {page.path}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">
                  {page.totalViews.toLocaleString()}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {page.uniques.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
