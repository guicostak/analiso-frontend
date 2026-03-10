import { Search, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExploreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilters: {
    sectors: string[];
    statuses: string[];
    sizes: string[];
    dividend: boolean | null;
  };
  onFilterChange: (filters: any) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sectors = ['Technology', 'Healthcare', 'Financial', 'Energy', 'Consumer', 'Industrial'];
const statuses = ['Healthy', 'Attention', 'Risk'];
const sizes = ['Large', 'Mid', 'Small'];

export function ExploreHeader({
  searchQuery,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  sortBy,
  onSortChange,
}: ExploreHeaderProps) {
  const toggleSector = (sector: string) => {
    const newSectors = selectedFilters.sectors.includes(sector)
      ? selectedFilters.sectors.filter((s) => s !== sector)
      : [...selectedFilters.sectors, sector];
    onFilterChange({ ...selectedFilters, sectors: newSectors });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = selectedFilters.statuses.includes(status)
      ? selectedFilters.statuses.filter((s) => s !== status)
      : [...selectedFilters.statuses, status];
    onFilterChange({ ...selectedFilters, statuses: newStatuses });
  };

  const toggleSize = (size: string) => {
    const newSizes = selectedFilters.sizes.includes(size)
      ? selectedFilters.sizes.filter((s) => s !== size)
      : [...selectedFilters.sizes, size];
    onFilterChange({ ...selectedFilters, sizes: newSizes });
  };

  const toggleDividend = () => {
    onFilterChange({
      ...selectedFilters,
      dividend: selectedFilters.dividend === true ? null : true,
    });
  };

  const hasActiveFilters =
    selectedFilters.sectors.length > 0 ||
    selectedFilters.statuses.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.dividend !== null;

  const clearFilters = () => {
    onFilterChange({
      sectors: [],
      statuses: [],
      sizes: [],
      dividend: null,
    });
    onSearchChange('');
  };

  return (
    <div className="mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          placeholder="Search companies, tickers, or sectors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 focus:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-100 transition-all"
        />
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Sector Filter */}
        <div className="relative group">
          <button className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-sm font-medium text-neutral-700 flex items-center gap-2 transition-colors">
            Sector
            {selectedFilters.sectors.length > 0 && (
              <span className="bg-mint-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {selectedFilters.sectors.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[200px]">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => toggleSector(sector)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-50 transition-colors ${
                  selectedFilters.sectors.includes(sector) ? 'bg-mint-50 text-mint-700 font-medium' : 'text-neutral-700'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="relative group">
          <button className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-sm font-medium text-neutral-700 flex items-center gap-2 transition-colors">
            Status
            {selectedFilters.statuses.length > 0 && (
              <span className="bg-mint-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {selectedFilters.statuses.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[180px]">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-50 transition-colors ${
                  selectedFilters.statuses.includes(status) ? 'bg-mint-50 text-mint-700 font-medium' : 'text-neutral-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="relative group">
          <button className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-sm font-medium text-neutral-700 flex items-center gap-2 transition-colors">
            Size
            {selectedFilters.sizes.length > 0 && (
              <span className="bg-mint-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {selectedFilters.sizes.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[160px]">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-neutral-50 transition-colors ${
                  selectedFilters.sizes.includes(size) ? 'bg-mint-50 text-mint-700 font-medium' : 'text-neutral-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Dividend Filter */}
        <button
          onClick={toggleDividend}
          className={`px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors ${
            selectedFilters.dividend === true
              ? 'border-mint-300 bg-mint-50 text-mint-700'
              : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
          }`}
        >
          Dividend
        </button>

        {/* Sort Dropdown */}
        <div className="ml-auto flex items-center gap-3">
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={clearFilters}
              className="px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </motion.button>
          )}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white text-sm font-medium text-neutral-700 focus:border-mint-400 focus:outline-none focus:ring-2 focus:ring-mint-100 transition-all cursor-pointer"
          >
            <option value="urgency">Sort by: Urgency</option>
            <option value="updated">Sort by: Most Updated</option>
            <option value="change">Sort by: Biggest Change</option>
          </select>
        </div>
      </div>
    </div>
  );
}
