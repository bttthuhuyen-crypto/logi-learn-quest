import React, { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Users, Search, LayoutGrid, List, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MemberCard } from '@/components/members/MemberCard';
import { MembersFilterBar } from '@/components/members/MembersFilterBar';
import { MembersAdminSection } from '@/components/members/MembersAdminSection';
import { MembersEmptyState } from '@/components/members/MembersEmptyState';
import { InviteMembersModal } from '@/components/members/InviteMembersModal';
import { useCommunityMembers, useMembersCount, MemberFilters } from '@/hooks/useCommunityMembers';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const Members = () => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { isAdmin } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Parse filters from URL
  const getFiltersFromURL = useCallback((): MemberFilters => {
    return {
      search: searchParams.get('q') || '',
      role: (searchParams.get('role') as MemberFilters['role']) || 'all',
      status: (searchParams.get('status') as MemberFilters['status']) || 'all',
      levelRange: (searchParams.get('level') as MemberFilters['levelRange']) || 'all',
      joinedPeriod: (searchParams.get('joined') as MemberFilters['joinedPeriod']) || 'all',
      sortBy: (searchParams.get('sort') as MemberFilters['sortBy']) || 'recent',
    };
  }, [searchParams]);

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    (searchParams.get('view') as 'grid' | 'list') || 'grid'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '0', 10)
  );

  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search with URL
  React.useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      newParams.set('q', debouncedSearch);
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams, { replace: true });
  }, [debouncedSearch, searchParams, setSearchParams]);

  const filters = useMemo(() => ({
    ...getFiltersFromURL(),
    search: debouncedSearch,
  }), [getFiltersFromURL, debouncedSearch]);

  const { data: members, isLoading } = useCommunityMembers(filters, currentPage);
  const { data: totalCount } = useMembersCount();

  const updateFilter = useCallback((key: keyof MemberFilters, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all' || !value) {
      newParams.delete(key === 'levelRange' ? 'level' : key === 'joinedPeriod' ? 'joined' : key === 'sortBy' ? 'sort' : key);
    } else {
      const urlKey = key === 'levelRange' ? 'level' : key === 'joinedPeriod' ? 'joined' : key === 'sortBy' ? 'sort' : key;
      newParams.set(urlKey, value);
    }
    newParams.delete('page'); // Reset page when filter changes
    setCurrentPage(0);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    const f = filters;
    return (
      (f.role && f.role !== 'all') ||
      (f.status && f.status !== 'all') ||
      (f.levelRange && f.levelRange !== 'all') ||
      (f.joinedPeriod && f.joinedPeriod !== 'all') ||
      (f.sortBy && f.sortBy !== 'recent') ||
      !!f.search
    );
  }, [filters]);

  const clearFilters = useCallback(() => {
    setSearchInput('');
    setCurrentPage(0);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('view', mode);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    if (page === 0) {
      newParams.delete('page');
    } else {
      newParams.set('page', page.toString());
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const effectiveViewMode = isMobile ? 'list' : viewMode;

  // Filter out admins from members list (they're shown in admin section)
  const regularMembers = useMemo(() => {
    if (!members) return [];
    return members.filter(m => !['owner', 'admin', 'moderator'].includes(m.role || ''));
  }, [members]);

  const hasNextPage = (members?.length || 0) >= 20;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 bg-background pb-4 -mx-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">👥 {t.members.title}</h1>
                <p className="text-muted-foreground">
                  {totalCount ?? 0} {t.members.memberCount}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-64 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.members.searchPlaceholder}
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              {/* Invite Button - Admin Only */}
              {isAdmin && (
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{t.admin.inviteMember}</span>
                </Button>
              )}

              {/* View Toggle - Hidden on mobile */}
              {!isMobile && (
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => handleViewModeChange('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => handleViewModeChange('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.members.searchPlaceholder}
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="overflow-x-auto -mx-4 px-4 pb-2">
            <MembersFilterBar
              filters={filters}
              onFilterChange={updateFilter}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>

        {/* Admins Section */}
        <MembersAdminSection viewMode={effectiveViewMode} />

        {/* Members Section */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            {t.members.filterRoleMember} ({regularMembers.length})
          </h2>

          {isLoading ? (
            <div className={effectiveViewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              : "space-y-2"
            }>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className={effectiveViewMode === 'grid' ? "h-32" : "h-20"} />
              ))}
            </div>
          ) : regularMembers.length === 0 ? (
            <MembersEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              {effectiveViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {regularMembers.map(member => (
                    <MemberCard key={member.user_id} member={member} viewMode={effectiveViewMode} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {regularMembers.map(member => (
                    <MemberCard key={member.user_id} member={member} viewMode={effectiveViewMode} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {(currentPage > 0 || hasNextPage) && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 0 && (
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationLink isActive>
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>

                      {hasNextPage && (
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="cursor-pointer"
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Invite Members Modal */}
        <InviteMembersModal 
          open={showInviteModal} 
          onOpenChange={setShowInviteModal} 
        />
      </div>
    </MainLayout>
  );
};

export default Members;
