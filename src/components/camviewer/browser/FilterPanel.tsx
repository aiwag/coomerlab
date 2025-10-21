
// `src/components/camviewer/browser/FilterPanel.tsx`**

import React from 'react';
import { useBrowserStore, SortByType } from '@/state/browserStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label
 } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export function FilterPanel() {
    const { filterPanelOpen, filters, setFilters, sortBy, setSortBy, clearFilters } = useBrowserStore();

    if (!filterPanelOpen) return null;

    return (
        <div className="p-3 border-b border-neutral-700 bg-neutral-800/50 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="sort-by" className="text-xs">Sort By</Label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortByType)}>
                        <SelectTrigger id="sort-by" className="h-9 mt-1">
                            <SelectValue placeholder="Sort by..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="num_users">Viewers</SelectItem>
                            <SelectItem value="num_followers">Followers</SelectItem>
                            <SelectItem value="display_age">Age</SelectItem>
                            <SelectItem value="start_dt_utc">Newest Session</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label htmlFor="region" className="text-xs">Region (e.g. US)</Label>
                    <Input id="region" placeholder="Country Code" value={filters.region} onChange={(e) => setFilters({ region: e.target.value })} className="h-9 mt-1" />
                </div>
            </div>
             <div>
                <Label className="text-xs">Min Viewers: {filters.minViewers.toLocaleString()}</Label>
                <Slider defaultValue={[0]} value={[filters.minViewers]} onValueChange={([v]) => setFilters({ minViewers: v })} max={5000} step={50} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
                <Label htmlFor="show-new" className="flex flex-col gap-1">
                    <span>New Models</span>
                    <span className="text-xs text-neutral-400">Only show new streamers</span>
                </Label>
                <Switch id="show-new" checked={filters.showNew} onCheckedChange={(c) => setFilters({ showNew: c })} />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="show-verified" className="flex flex-col gap-1">
                    <span>Age Verified</span>
                    <span className="text-xs text-neutral-400">Only show 18+ verified</span>
                </Label>
                <Switch id="show-verified" checked={filters.showVerified} onCheckedChange={(c) => setFilters({ showVerified: c })} />
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>Clear All Filters</Button>
        </div>
    );
}