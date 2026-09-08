import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permissions";
import { getPaginatedPosts, getArchivedPosts, getUserLikedPostIds } from "@/actions/feed";
import { getUserBookmarkedPostIds } from "@/actions/bookmark";
import { getFollowSuggestions } from "@/actions/follow";
import { FeedView } from "./FeedView";
import { PeopleToFollow } from "@/components/feed/PeopleToFollow";
import { Pagination } from "@/components/ui/Pagination";
import DashboardShell from "@/components/layout/DashboardShell";

export const revalidate = 30;

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ page?: string; tab?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const tab = params.tab || 'recent';
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const isAdmin = user.role === "super_admin" || user.role === "admin";

  const [paginatedPosts, archivedPosts, followSuggestions] = await Promise.all([
    getPaginatedPosts(page),
    isAdmin ? getArchivedPosts() : Promise.resolve([]),
    getFollowSuggestions(8),
  ]);

  const postIds = paginatedPosts.items.map((p) => p.id);
  const [likedPostIds, bookmarkedPostIds] = await Promise.all([
    getUserLikedPostIds(postIds),
    getUserBookmarkedPostIds(postIds),
  ]);

  return (
    <DashboardShell
      rightSidebar={
        <>
          <div style={{
            border: '1px solid #E8E4DC',
            borderRadius: '10px',
            padding: '16px 18px',
            background: 'linear-gradient(180deg, #FFFFFF, #FAF9F6)',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FB651E', fontWeight: 600, marginBottom: '6px' }}>New</div>
            <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '4px' }}>YC Interview Prep</div>
            <div style={{ fontSize: '12.5px', color: '#5C5852', marginBottom: '12px', lineHeight: '1.5' }}>10 minutes with a panel of YC partners. Built from real interview transcripts.</div>
            <a href="https://interview.outsome.co" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', height: '32px', alignItems: 'center', padding: '0 12px',
              borderRadius: '7px', background: '#2F2C26', color: '#fff', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
            }}>Start a mock interview &rarr;</a>
          </div>
          <PeopleToFollow
          suggestions={followSuggestions}
          currentUserId={user.id}
        />
        </>
      }
    >
      <FeedView
        posts={paginatedPosts.items}
        archivedPosts={archivedPosts}
        currentUser={user}
        isAdmin={isAdmin}
        initialTab={tab}
        likedPostIds={likedPostIds}
        bookmarkedPostIds={bookmarkedPostIds}
      />
      <Pagination
        currentPage={paginatedPosts.page}
        totalPages={paginatedPosts.totalPages}
        basePath="/feed"
      />
    </DashboardShell>
  );
}

